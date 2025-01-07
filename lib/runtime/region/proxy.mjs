import { hasOwnNarrow, map } from "../../util.mjs";
import {
  isInternalArray,
  isNonLengthPropertyKey,
  isDataDescriptor,
} from "../domain.mjs";
import { applyPlainInternalClosure } from "./closure.mjs";
import { getInternal, hasInternal, setInternal } from "./reflect.mjs";
import {
  enterAccessor,
  enterPrototype,
  enterReference,
  enterValue,
  leaveAccessor,
  leavePrototype,
  leaveReference,
  leaveValue,
} from "./util.mjs";

/**
 * @type {(
 *   region: import(".").Region,
 *   descriptor: undefined | import("../domain").Descriptor<
 *     import("../domain").InternalValue,
 *     import("../domain").InternalReference,
 *   >,
 * ) => undefined | import("../domain").Descriptor<
 *   import("../domain").ExternalValue,
 *   import("../domain").ExternalReference,
 * >}
 */
const toExternalDescriptor = (region, descriptor) => {
  if (descriptor == null) {
    return descriptor;
  } else {
    if (isDataDescriptor(descriptor)) {
      return {
        ...descriptor,
        value: leaveValue(region, descriptor.value),
      };
    } else {
      return {
        ...descriptor,
        get: leaveAccessor(region, descriptor.get),
        set: leaveAccessor(region, descriptor.set),
      };
    }
  }
};

/**
 * @type {(
 *   region: import(".").Region,
 *   descriptor: import("../domain").DefineDescriptor<
 *     import("../domain").ExternalValue,
 *     import("../domain").ExternalReference,
 *   >,
 * ) => import("../domain").DefineDescriptor<
 *   import("../domain").InternalValue,
 *   import("../domain").InternalReference,
 * >}
 */
const toInternalDescriptor = (region, descriptor) =>
  /** @type {any} */ ({
    ...descriptor,
    ...(hasOwnNarrow(descriptor, "value")
      ? { value: enterValue(region, descriptor.value) }
      : null),
    ...(hasOwnNarrow(descriptor, "get")
      ? { get: enterAccessor(region, descriptor.get) }
      : null),
    ...(hasOwnNarrow(descriptor, "set")
      ? { set: enterAccessor(region, descriptor.set) }
      : null),
  });

/**
 * @type {(
 *   region: import(".").Region,
 * ) => import("./proxy").GuestExternalReferenceHandler}
 */
export const compileGuestExternalReferenceHandler = (region) => {
  const {
    global: {
      Reflect: {
        construct,
        getPrototypeOf,
        setPrototypeOf,
        defineProperty,
        getOwnPropertyDescriptor,
      },
    },
  } = region;
  return {
    apply: (target, that, input) =>
      leaveValue(
        region,
        applyPlainInternalClosure(
          region,
          target,
          enterValue(region, that),
          map(input, (value) => enterValue(region, value)),
        ),
      ),
    construct: (target, input, new_target) =>
      leaveReference(
        region,
        construct(
          target,
          map(input, (value) => enterValue(region, value)),
          enterReference(region, new_target),
        ),
      ),
    getPrototypeOf: (target) => leavePrototype(region, getPrototypeOf(target)),
    setPrototypeOf: (target, prototype) =>
      setPrototypeOf(target, enterPrototype(region, prototype)),
    defineProperty: (target, key, descriptor) => {
      if (isInternalArray(target)) {
        if (isNonLengthPropertyKey(key)) {
          return defineProperty(
            target,
            key,
            toInternalDescriptor(region, descriptor),
          );
        } else {
          return defineProperty(target, "length", descriptor);
        }
      } else {
        return defineProperty(
          target,
          key,
          toInternalDescriptor(region, descriptor),
        );
      }
    },
    getOwnPropertyDescriptor: (target, key) => {
      if (isInternalArray(target)) {
        if (isNonLengthPropertyKey(key)) {
          return toExternalDescriptor(
            region,
            getOwnPropertyDescriptor(target, key),
          );
        } else {
          return getOwnPropertyDescriptor(target, "length");
        }
      } else {
        return toExternalDescriptor(
          region,
          getOwnPropertyDescriptor(target, key),
        );
      }
    },
    has: (target, key) => hasInternal(region, target, key),
    get: (target, key, receiver) =>
      leaveValue(
        region,
        getInternal(region, target, key, enterValue(region, receiver)),
      ),
    set: (target, key, value, receiver) =>
      setInternal(
        region,
        target,
        key,
        enterValue(region, value),
        enterValue(region, receiver),
      ),
  };
};
