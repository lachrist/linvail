import { LinvailTypeError } from "../error.mjs";
import { map } from "../util/array.mjs";
import { compileGet } from "../util/record.mjs";
import { isDataDescriptor, isNonLengthPropertyKey } from "./domain.mjs";
import { apply_oracle_mapping, construct_oracle_mapping } from "./oracle.mjs";
import { applyHostReference } from "./region/closure.mjs";
import {
  enterStandardPrimitive,
  enterPrototype,
  enterReference,
  enterValue,
} from "./region/core.mjs";
import {
  defineOwnPlainInternal,
  getOwnPlainInternal,
} from "./region/property.mjs";

/**
 * @type {(
 *   region: import("./region/region.d.ts").Region,
 *   operation: keyof Reflect | "hasOwn",
 *   target: import("./domain.d.ts").PrimitiveWrapper,
 * ) => Error}
 */
const createTargetError = (
  { "global.TypeError": TypeError, "global.String": String },
  operation,
  target,
) => new TypeError(`${operation} cannot primitive (${String(target.base)})`);

const getBase = compileGet("base");

/**
 * @type {(
 *   region: import("./region/region.d.ts").Region,
 *   target: import("./domain.d.ts").Wrapper,
 *   that: import("./domain.d.ts").Wrapper,
 *   input: import("./domain.d.ts").Wrapper[],
 * ) => import("./domain.d.ts").Wrapper}
 */
export const applyInternal = (region, target, that, input) => {
  switch (target.type) {
    case "primitive": {
      throw createTargetError(region, "apply", target);
    }
    case "host": {
      return applyHostReference(region, target, that, input);
    }
    case "guest": {
      const { name } = target;
      const oracle = name && apply_oracle_mapping[name];
      if (oracle) {
        return oracle(region, that, input);
      } else {
        const { "global.Reflect.apply": apply } = region;
        return enterValue(
          region,
          apply(target.base, that.base, map(input, getBase)),
        );
      }
    }
    default: {
      throw new LinvailTypeError(target);
    }
  }
};

/**
 * @type {(
 *   region: import("./region/region.d.ts").Region,
 *   target: import("./domain.d.ts").Wrapper,
 *   input: import("./domain.d.ts").Wrapper[],
 *   new_target: import("./domain.d.ts").Wrapper,
 * ) => import("./domain.d.ts").ReferenceWrapper}
 */
export const constructInternal = (region, target, input, new_target) => {
  switch (target.type) {
    case "primitive": {
      throw createTargetError(region, "construct", target);
    }
    case "host": {
      const { "global.Reflect.construct": construct } = region;
      return construct(target.plain, input, new_target.base);
    }
    case "guest": {
      const { name } = target;
      const oracle = name && construct_oracle_mapping[name];
      if (oracle) {
        if (new_target.type === "primitive") {
          throw createTargetError(region, "construct", new_target);
        } else {
          return oracle(region, input, new_target);
        }
      } else {
        const { "global.Reflect.construct": construct } = region;
        return enterReference(
          region,
          construct(target.base, map(input, getBase), new_target.base),
        );
      }
    }
    default: {
      throw new LinvailTypeError(target);
    }
  }
};

/**
 * @type {(
 *   region: import("./region/region.d.ts").Region,
 *   target: import("./domain.d.ts").Wrapper,
 * ) => boolean}
 */
export const preventInternalExtension = (region, target) => {
  const { "global.Reflect.preventExtensions": preventExtensions } = region;
  switch (target.type) {
    case "primitive": {
      throw createTargetError(region, "preventExtensions", target);
    }
    case "host": {
      return preventExtensions(target.plain);
    }
    case "guest": {
      return preventExtensions(target.base);
    }
    default: {
      throw new LinvailTypeError(target);
    }
  }
};

/**
 * @type {(
 *   region: import("./region/region.d.ts").Region,
 *   target: import("./domain.d.ts").Wrapper,
 * ) => boolean}
 */
export const isInternalExtensible = (region, target) => {
  const { "global.Reflect.isExtensible": isExtensible } = region;
  switch (target.type) {
    case "primitive": {
      throw createTargetError(region, "isExtensible", target);
    }
    case "host": {
      return isExtensible(target.plain);
    }
    case "guest": {
      return isExtensible(target.base);
    }
    default: {
      throw new LinvailTypeError(target);
    }
  }
};

/**
 * @type {(
 *   region: import("./region/region.d.ts").Region,
 *   target: import("./domain.d.ts").Wrapper,
 * ) => null | import("./domain.d.ts").Reference}
 */
export const getInternalPrototype = (region, target) => {
  const { "global.Reflect.getPrototypeOf": getPrototypeOf } = region;
  switch (target.type) {
    case "primitive": {
      throw createTargetError(region, "getPrototypeOf", target);
    }
    case "host": {
      return getPrototypeOf(target.plain);
    }
    case "guest": {
      return getPrototypeOf(target.base);
    }
    default: {
      throw new LinvailTypeError(target);
    }
  }
};

/**
 * @type {(
 *   region: import("./region/region.d.ts").Region,
 *   target: import("./domain.d.ts").Wrapper,
 *   prototype: null | import("./domain.d.ts").Reference,
 * ) => boolean}
 */
export const setInternalPrototype = (region, target, prototype) => {
  const { "global.Reflect.setPrototypeOf": setPrototypeOf } = region;
  switch (target.type) {
    case "primitive": {
      throw createTargetError(region, "setPrototypeOf", target);
    }
    case "host": {
      return setPrototypeOf(target.plain, prototype);
    }
    case "guest": {
      return setPrototypeOf(target.base, prototype);
    }
    default: {
      throw new LinvailTypeError(target);
    }
  }
};

/**
 * @type {(
 *   region: import("./region/region.d.ts").Region,
 *   target: import("./domain.d.ts").Wrapper,
 *   key: PropertyKey,
 * ) => boolean}
 */
export const deleteInternalOwnProperty = (region, target, key) => {
  const { "global.Reflect.deleteProperty": deleteProperty } = region;
  switch (target.type) {
    case "primitive": {
      throw createTargetError(region, "deleteProperty", target);
    }
    case "host": {
      return deleteProperty(target.plain, key);
    }
    case "guest": {
      return deleteProperty(target.base, key);
    }
    default: {
      throw new LinvailTypeError(target);
    }
  }
};

/**
 * @type {(
 *   region: import("./region/region.d.ts").Region,
 *   target: import("./domain.d.ts").Wrapper,
 * ) => (string | symbol)[]}
 */
export const listInternalOwnPropertyKey = (region, target) => {
  const { "global.Reflect.ownKeys": ownKeys } = region;
  switch (target.type) {
    case "primitive": {
      throw createTargetError(region, "ownKeys", target);
    }
    case "host": {
      return ownKeys(target.plain);
    }
    case "guest": {
      return ownKeys(target.base);
    }
    default: {
      throw new LinvailTypeError(target);
    }
  }
};

/**
 * @type {(
 *   region: import("./region/region.d.ts").Region,
 *   target: import("./domain.d.ts").Wrapper,
 *   key: PropertyKey,
 * ) => boolean}
 */
export const hasInternalOwnProperty = (region, target, key) => {
  const { "global.Object.hasOwn": hasOwn } = region;
  switch (target.type) {
    case "primitive": {
      throw createTargetError(region, "hasOwn", target);
    }
    case "host": {
      return hasOwn(target.plain, key);
    }
    case "guest": {
      return hasOwn(target.base, key);
    }
    default: {
      throw new LinvailTypeError(target);
    }
  }
};

/**
 * @type {(
 *   region: import("./region/region.d.ts").Region,
 *   target: import("./domain.d.ts").Wrapper,
 *   property: PropertyKey,
 * ) => undefined | import("./domain.d.ts").HostDescriptor}
 */
export const getInternalOwnPropertyDescriptor = (region, target, key) => {
  switch (target.type) {
    case "primitive": {
      throw createTargetError(region, "getOwnPropertyDescriptor", target);
    }
    case "guest": {
      const {
        "global.Reflect.getOwnPropertyDescriptor": getOwnPropertyDescriptor,
      } = region;
      const descriptor = getOwnPropertyDescriptor(target.base, key);
      if (descriptor) {
        if (isDataDescriptor(descriptor)) {
          return {
            ...descriptor,
            value: enterValue(region, descriptor.value),
          };
        } else {
          return descriptor;
        }
      } else {
        return descriptor;
      }
    }
    case "host": {
      const {
        "global.Reflect.getOwnPropertyDescriptor": getOwnPropertyDescriptor,
      } = region;
      if (target.kind === "array") {
        if (isNonLengthPropertyKey(key)) {
          return getOwnPropertyDescriptor(target.plain, key);
        } else {
          const descriptor = getOwnPropertyDescriptor(target.plain, "length");
          return {
            ...descriptor,
            value: enterValue(region, descriptor.value),
          };
        }
      } else {
        return getOwnPropertyDescriptor(target.plain, key);
      }
    }
    default: {
      throw new LinvailTypeError(target);
    }
  }
};

/**
 * @type {(
 *   region: import("./region/region.d.ts").Region,
 *   target: import("./domain.d.ts").Wrapper,
 *   key: PropertyKey,
 *   descriptor: import("./domain.d.ts").HostDefineDescriptor,
 * ) => boolean}
 */
export const defineInternalPropertyDescriptor = (
  region,
  target,
  key,
  host_descriptor,
) => {
  switch (target.type) {
    case "primitive": {
      throw createTargetError(region, "defineProperty", target);
    }
    case "guest": {
      const { "global.Reflect.defineProperty": defineProperty } = region;
      /** @type {import("./domain.d.ts").GuestDefineDescriptor} */
      const guest_descriptor = { __proto__: null };
      if ("writable" in host_descriptor) {
        guest_descriptor.writable = host_descriptor.writable;
      }
      if ("enumerable" in host_descriptor) {
        guest_descriptor.enumerable = host_descriptor.enumerable;
      }
      if ("configurable" in host_descriptor) {
        guest_descriptor.configurable = host_descriptor.configurable;
      }
      if ("value" in host_descriptor) {
        guest_descriptor.value = host_descriptor.value.base;
      }
      if ("get" in host_descriptor) {
        guest_descriptor.get = host_descriptor.get;
      }
      if ("set" in host_descriptor) {
        guest_descriptor.set = host_descriptor.set;
      }
      return defineProperty(target.base, key, guest_descriptor);
    }
    case "host": {
      return defineOwnPlainInternal(region, target, key, host_descriptor);
    }
    default: {
      throw new LinvailTypeError(target);
    }
  }
};

/**
 * @type {(
 *   region: import("./region/region.d.ts").Region,
 *   target: import("./domain.d.ts").Wrapper,
 *   key: PropertyKey,
 * ) => boolean}
 */
export const hasInternalProperty = (region, target, key) => {
  const {
    "global.Object.hasOwn": hasOwn,
    "global.Reflect.getPrototypeOf": getPrototypeOf,
    "global.Reflect.has": has,
  } = region;
  if (target.type === "primitive") {
    throw createTargetError(region, "has", target);
  }
  /** @type {null | import("./domain.d.ts").ReferenceWrapper} */
  let current = target;
  while (current !== null) {
    if (current.type === "guest") {
      // We have to yield to Reflect.has because current could be a proxy.
      return has(current.base, key);
    }
    if (hasOwn(current.plain, key)) {
      return true;
    }
    current = enterPrototype(region, getPrototypeOf(current.plain));
  }
  return false;
};

/**
 * @type {(
 *   region: import("./region/region.d.ts").Region,
 *   target: import("./domain.d.ts").Wrapper,
 *   key: PropertyKey,
 *   receiver: import("./domain.d.ts").Wrapper,
 * ) => import("./domain.d.ts").Wrapper}
 */
export const getInternalPropertyValue = (region, target, key, receiver) => {
  const {
    "global.Array.prototype": array_prototype,
    "global.Object.prototype": object_prototype,
    "global.undefined": undefined,
    "global.Reflect.getPrototypeOf": getPrototypeOf,
    "global.Reflect.getOwnPropertyDescriptor": getOwnPropertyDescriptor,
    "global.Reflect.get": get,
  } = region;
  if (target.type === "primitive") {
    throw createTargetError(region, "has", target);
  }
  /** @type {null | import("./domain.d.ts").ReferenceWrapper} */
  let current = target;
  while (current !== null) {
    if (current.type === "guest") {
      if (
        current.base === array_prototype ||
        current.base === object_prototype
      ) {
        const descriptor = getOwnPropertyDescriptor(current.base, key);
        if (descriptor) {
          if (isDataDescriptor(descriptor)) {
            return enterValue(region, descriptor.value);
          } else {
            const { get: getter } = descriptor;
            if (getter) {
              return applyInternal(
                region,
                enterReference(region, getter),
                receiver,
                [],
              );
            } else {
              return enterStandardPrimitive(region, undefined);
            }
          }
        }
        current = enterPrototype(region, getPrototypeOf(current.base));
      } else {
        // We have to yield to Reflect.get because current could be a proxy.
        return enterValue(region, get(current.base, key, receiver.base));
      }
    } else {
      const descriptor = getOwnPlainInternal(region, current, key);
      if (descriptor) {
        if (isDataDescriptor(descriptor)) {
          return descriptor.value;
        } else {
          const { get } = descriptor;
          if (get) {
            return applyInternal(
              region,
              enterReference(region, get),
              receiver,
              [],
            );
          } else {
            return enterStandardPrimitive(region, undefined);
          }
        }
      }
      current = enterPrototype(region, getPrototypeOf(current.plain));
    }
  }
  return enterStandardPrimitive(region, undefined);
};

/**
 * @type {(
 *   region: import("./region/region.d.ts").Region,
 *   target: import("./domain.d.ts").Wrapper,
 *   key: PropertyKey,
 *   value: import("./domain.d.ts").Wrapper,
 *   receiver: import("./domain.d.ts").Wrapper,
 * ) => boolean}
 */
export const setInternalPropertyValue = (
  region,
  target,
  key,
  value,
  receiver,
) => {
  const {
    "global.Array.prototype": array_prototype,
    "global.Object.prototype": object_prototype,
    "global.Reflect.getPrototypeOf": getPrototypeOf,
    "global.Reflect.getOwnPropertyDescriptor": getOwnPropertyDescriptor,
    "global.Reflect.set": set,
  } = region;
  if (target.type === "primitive") {
    throw createTargetError(region, "set", target);
  }
  /** @type {null | import("./domain.d.ts").ReferenceWrapper} */
  let current = target;
  while (current !== null) {
    if (current.type === "guest") {
      if (
        current.base === array_prototype ||
        current.base === object_prototype
      ) {
        const descriptor = getOwnPropertyDescriptor(current.base, key);
        if (descriptor) {
          if (isDataDescriptor(descriptor)) {
            if (descriptor.writable) {
              break;
            } else {
              return false;
            }
          } else {
            const { set: setter } = descriptor;
            if (setter) {
              applyInternal(region, enterReference(region, setter), receiver, [
                value,
              ]);
            }
            return !!setter;
          }
        }
        current = enterPrototype(region, getPrototypeOf(current.base));
      } else {
        // We have to yield to Reflect.set because current could be a proxy.
        return set(current.base, key, value.base, receiver.base);
      }
    } else {
      const descriptor = getOwnPlainInternal(region, current, key);
      if (descriptor) {
        if (isDataDescriptor(descriptor)) {
          if (descriptor.writable) {
            break;
          } else {
            return false;
          }
        } else {
          const { set } = descriptor;
          if (set) {
            applyInternal(region, enterReference(region, set), receiver, [
              value,
            ]);
          }
          return !!set;
        }
      }
      current = enterPrototype(region, getPrototypeOf(current.plain));
    }
  }
  if (receiver.type === "primitive") {
    return false;
  } else if (receiver.type === "guest" || receiver.type === "host") {
    const descriptor = getInternalOwnPropertyDescriptor(region, receiver, key);
    if (descriptor) {
      if (isDataDescriptor(descriptor)) {
        if (descriptor.writable) {
          return defineInternalPropertyDescriptor(region, receiver, key, {
            __proto__: null,
            ...descriptor,
            value,
          });
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      return defineInternalPropertyDescriptor(region, receiver, key, {
        __proto__: null,
        writable: true,
        configurable: true,
        enumerable: true,
        value,
      });
    }
  } else {
    throw new LinvailTypeError(receiver);
  }
};
