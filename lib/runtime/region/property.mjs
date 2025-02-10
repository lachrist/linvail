import { hasOwnNarrow } from "../../util/record.mjs";
import {
  isDataDescriptor,
  isNonLengthPropertyKey,
  isPlainInternalArray,
} from "../domain.mjs";
import { enterPrimitive } from "./core.mjs";
import { leaveAccessor, leaveValue } from "./util.mjs";

const {
  Object: { hasOwn },
} = globalThis;

/**
 * @type {(
 *   region: import("./region").Region,
 *   target: import("../domain").PlainInternalReference,
 *   key: PropertyKey
 * ) => undefined | import("../domain").InternalDescriptor}
 */
export const getOwnPlainInternal = (region, target, key) => {
  const {
    "global.Reflect.getOwnPropertyDescriptor": getOwnPropertyDescriptor,
  } = region;
  if (isPlainInternalArray(target)) {
    if (isNonLengthPropertyKey(key)) {
      return getOwnPropertyDescriptor(target, key);
    } else {
      const descriptor = getOwnPropertyDescriptor(target, "length");
      return {
        ...descriptor,
        value: enterPrimitive(region, descriptor.value),
      };
    }
  } else {
    return getOwnPropertyDescriptor(target, key);
  }
};

/**
 * @type {(
 *   region: import("./region").Region,
 *   descriptor: import("../domain").InternalDefineDescriptor
 * ) => import("../domain").ExternalDefineDescriptor}
 */
const toExternalDefineDescriptor = (region, descriptor) => {
  /** @type {import("../domain").ExternalDefineDescriptor} */
  const external_descriptor = { __proto__: null };
  if (hasOwnNarrow(descriptor, "get")) {
    external_descriptor.get = leaveAccessor(region, descriptor.get);
  }
  if (hasOwnNarrow(descriptor, "set")) {
    external_descriptor.set = leaveAccessor(region, descriptor.set);
  }
  if (hasOwnNarrow(descriptor, "value")) {
    external_descriptor.value = leaveValue(region, descriptor.value);
  }
  if (hasOwnNarrow(descriptor, "writable")) {
    external_descriptor.writable = descriptor.writable;
  }
  if (hasOwnNarrow(descriptor, "enumerable")) {
    external_descriptor.enumerable = descriptor.enumerable;
  }
  if (hasOwnNarrow(descriptor, "configurable")) {
    external_descriptor.configurable = descriptor.configurable;
  }
  return external_descriptor;
};

/**
 * @type {<O, K>(
 *   region: import("./region").Region,
 *   old_descriptor: undefined | import("../domain").InternalDescriptor,
 *   new_descriptor: import("../domain").InternalDefineDescriptor,
 * ) => import("../domain").InternalDefineDescriptor}
 */
export const sanitizeInternalDefineDescriptor = (
  region,
  old_descriptor,
  new_descriptor,
) => {
  const { "global.undefined": undefined, "global.Object.is": is } = region;
  if (
    !hasOwn(new_descriptor, "get") &&
    !hasOwn(new_descriptor, "set") &&
    !hasOwn(new_descriptor, "value") &&
    !old_descriptor
  ) {
    return {
      ...new_descriptor,
      value: enterPrimitive(region, undefined),
    };
  }
  if (
    old_descriptor &&
    isDataDescriptor(old_descriptor) &&
    hasOwnNarrow(new_descriptor, "value") &&
    is(
      leaveValue(region, old_descriptor.value),
      leaveValue(region, new_descriptor.value),
    )
  ) {
    return {
      ...new_descriptor,
      value: old_descriptor.value,
    };
  }
  return new_descriptor;
};

/**
 * @type {(
 *   region: import("./region").Region,
 *   target: import("../domain").PlainInternalReference,
 *   key: PropertyKey,
 *   descriptor: import("../domain").InternalDefineDescriptor,
 * ) => boolean}
 */
export const defineOwnPlainInternal = (region, target, key, descriptor) => {
  const {
    "global.Reflect.defineProperty": defineProperty,
    "global.Reflect.getOwnPropertyDescriptor": getOwnPropertyDescriptor,
  } = region;
  if (isPlainInternalArray(target)) {
    if (isNonLengthPropertyKey(key)) {
      return defineProperty(
        target,
        key,
        sanitizeInternalDefineDescriptor(
          region,
          getOwnPropertyDescriptor(target, key),
          descriptor,
        ),
      );
    } else {
      return defineProperty(
        target,
        "length",
        toExternalDefineDescriptor(region, descriptor),
      );
    }
  } else {
    return defineProperty(
      target,
      key,
      sanitizeInternalDefineDescriptor(
        region,
        getOwnPropertyDescriptor(target, key),
        descriptor,
      ),
    );
  }
};
