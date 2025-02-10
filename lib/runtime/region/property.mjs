import { hasOwnNarrow } from "../../util/record.mjs";
import { isNonLengthPropertyKey, isPlainInternalArray } from "../domain.mjs";
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
 *   target: import("../domain").PlainInternalReference,
 *   key: PropertyKey,
 *   descriptor: import("../domain").InternalDefineDescriptor,
 * ) => boolean}
 */
export const defineOwnPlainInternal = (region, target, key, descriptor) => {
  const {
    "global.undefined": undefined,
    "global.Reflect.defineProperty": defineProperty,
  } = region;
  if (isPlainInternalArray(target)) {
    if (isNonLengthPropertyKey(key)) {
      return defineProperty(target, key, descriptor);
    } else {
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
      return defineProperty(target, "length", external_descriptor);
    }
  } else {
    return defineProperty(
      target,
      key,
      !hasOwn(descriptor, "get") &&
        !hasOwn(descriptor, "set") &&
        !hasOwn(descriptor, "value") &&
        !hasOwn(target, key)
        ? { ...descriptor, value: enterPrimitive(region, undefined) }
        : descriptor,
    );
  }
};
