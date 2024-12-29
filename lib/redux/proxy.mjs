import { map } from "../util.mjs";
import { enter as enterRegion, leave as leaveRegion } from "./region.mjs";
import { isInternalArray } from "./domain.mjs";
import { isDataDescriptor } from "./descriptor.mjs";

const {
  undefined,
  Object: { hasOwn: hasOwnBuiltin },
} = globalThis;

/**
 * @type {(
 *   key: PropertyKey,
 * ) => key is import("./reflect").NonLengthPropertyKey}
 */
const isNonLengthPropertyKey = (key) => key !== "length";

/**
 * @type {<X>(
 *   target: (
 *     | import("./domain").IntrinsicInternalReference<X>
 *     | import("./domain").IntrinsicExternalReference
 *   ),
 *   key: import("./domain").ExternalValue,
 * ) => boolean}
 */
const hasOwn = /** @type {any} */ (hasOwnBuiltin);

/**
 * @template X
 * @param {import("./reflect").Reflect} Reflect
 * @param {import("./region").Region<X>} region
 * @returns {import("./proxy").ProxyHandler<X>}
 */
export const compileProxyHandler = (
  {
    apply,
    construct,
    getPrototypeOf,
    setPrototypeOf,
    getOwnPropertyDescriptor,
  },
  region,
) => {
  const {
    isExtrinsicExternalReference,
    infiltrateInternalReference,
    infiltrateExternalReference,
    isIntrinsicInternalReference,
    exfiltrateInternalReference,
    exfiltrateExternalReference,
  } = region;
  /**
   * @type {(
   *   value: import("./domain").ExternalValue,
   * ) => import("./domain").InternalValue<X>}
   */
  const enterValue = (value) => enterRegion(value, region);
  /**
   * @type {(
   *   value: import("./domain").InternalValue<X>,
   * ) => import("./domain").ExternalValue}
   */
  const leaveValue = (value) => leaveRegion(value, region);
  /**
   * @type {(
   *   prototype: import("./reflect").ExternalPrototype,
   * ) => import("./reflect").InternalPrototype<X>}
   */
  const enterPrototype = (prototype) =>
    prototype === null
      ? null
      : isExtrinsicExternalReference(prototype)
        ? infiltrateInternalReference(prototype)
        : infiltrateExternalReference(prototype);
  /**
   * @type {(
   *   prototype: import("./reflect").InternalPrototype<X>,
   * ) => import("./reflect").ExternalPrototype}
   */
  const leavePrototype = (prototype) =>
    prototype === null
      ? null
      : isIntrinsicInternalReference(prototype)
        ? exfiltrateInternalReference(prototype)
        : exfiltrateExternalReference(prototype);
  /**
   * @type {(
   *   descriptor: import("./descriptor").Descriptor<
   *     import("./domain").InternalValue<X>,
   *     import("./domain").InternalReference<X>
   *   >,
   *   reciever: import("./domain").ExternalValue,
   * ) => import("./domain").ExternalValue}
   */
  const getInternalDescriptor = (descriptor, receiver) => {
    if (isDataDescriptor(descriptor)) {
      return leaveValue(descriptor.value);
    } else {
      const { get } = descriptor;
      if (get == null) {
        return undefined;
      } else {
        if (isIntrinsicInternalReference(get)) {
          return leaveValue(apply(get, enterValue(receiver), []));
        } else {
          return apply(exfiltrateExternalReference(get), receiver, []);
        }
      }
    }
  };
  /**
   * @type {(
   *   descriptor: import("./descriptor").Descriptor<
   *     import("./domain").ExternalValue,
   *     import("./domain").ExternalReference
   *   >,
   *   reciever: import("./domain").ExternalValue,
   * ) => import("./domain").ExternalValue}
   */
  const getExternalDescriptor = (descriptor, receiver) => {
    if (isDataDescriptor(descriptor)) {
      return descriptor.value;
    } else {
      const { get } = descriptor;
      if (get == null) {
        return undefined;
      } else {
        if (isExtrinsicExternalReference(get)) {
          return leaveValue(
            apply(infiltrateInternalReference(get), enterValue(receiver), []),
          );
        } else {
          return apply(get, receiver, []);
        }
      }
    }
  };
  return {
    apply: (target, that, args) =>
      leaveValue(apply(target, enterValue(that), map(args, enterValue))),
    construct: (target, args, new_target) => {
      const result = construct(
        target,
        map(args, enterValue),
        isExtrinsicExternalReference(new_target)
          ? infiltrateInternalReference(new_target)
          : infiltrateExternalReference(new_target),
      );
      return isIntrinsicInternalReference(result)
        ? exfiltrateInternalReference(result)
        : exfiltrateExternalReference(result);
    },
    getPrototypeOf: (target) => leavePrototype(getPrototypeOf(target)),
    setPrototypeOf: (target, prototype) =>
      setPrototypeOf(target, enterPrototype(prototype)),
    defineProperty: TODO,
    getOwnPropertyDescriptor: (target, key) => {
      if (isInternalArray(target)) {
        if (isNonLengthPropertyKey(key)) {
          const descriptor = getOwnPropertyDescriptor(target, key);
        } else {
          return getOwnPropertyDescriptor(target, "length");
        }
      } else {
      }
    },
    has: (target, key) => {
      /**
       * @type {import("./reflect").InternalPrototype<X>}
       */
      let internal = target;
      while (internal !== null) {
        if (isIntrinsicInternalReference(internal)) {
          if (hasOwn(internal, key)) {
            return true;
          }
          internal = getPrototypeOf(internal);
        } else {
          const external = exfiltrateExternalReference(internal);
          if (hasOwn(external, key)) {
            return true;
          }
          internal = enterPrototype(getPrototypeOf(external));
        }
      }
      return false;
    },
    get: (target, key, receiver) => {
      /**
       * @type {import("./reflect").InternalPrototype<X>}
       */
      let internal = target;
      while (internal !== null) {
        if (isIntrinsicInternalReference(internal)) {
          if (isInternalArray(internal)) {
            if (isNonLengthPropertyKey(key)) {
              const descriptor = getOwnPropertyDescriptor(internal, key);
              if (descriptor) {
                return getInternalDescriptor(descriptor, receiver);
              } else {
                internal = getPrototypeOf(internal);
                continue;
              }
            } else {
              return getOwnPropertyDescriptor(internal, "length").value;
            }
          } else {
            const descriptor = getOwnPropertyDescriptor(internal, key);
            if (descriptor) {
              return getInternalDescriptor(descriptor, receiver);
            } else {
              internal = getPrototypeOf(internal);
              continue;
            }
          }
        } else {
          const external = exfiltrateExternalReference(internal);
          const descriptor = getOwnPropertyDescriptor(external, key);
          if (descriptor) {
            return getExternalDescriptor(descriptor, receiver);
          } else {
            internal = enterPrototype(getPrototypeOf(external));
            continue;
          }
        }
      }
      return undefined;
    },
    set: (_target, _key, _value, _receiver) => TODO,
  };
};
