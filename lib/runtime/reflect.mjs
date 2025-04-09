import { map } from "../util/array.mjs";
import { getMap } from "../util/collection.mjs";
import {
  isDataDescriptor,
  isPlainInternalArray,
  isNonLengthPropertyKey,
} from "./domain.mjs";
import { apply_oracle_mapping, construct_oracle_mapping } from "./oracle.mjs";
import { applyPlainInternalReference } from "./region/closure.mjs";
import {
  enterPrimitive,
  isGuestInternalReference,
  isInternalPrimitive,
  leavePlainExternalReference,
} from "./region/core.mjs";
import {
  defineOwnPlainInternal,
  getOwnPlainInternal,
} from "./region/property.mjs";
import {
  enterAccessor,
  enterPrototype,
  enterReference,
  enterValue,
  leaveAccessor,
  leavePrototype,
  leaveReference,
  leaveValue,
} from "./region/util.mjs";

/**
 * @type {(
 *   region: import("./region/region.d.ts").Region,
 *   target: import("./domain.d.ts").InternalReference,
 *   that: import("./domain.d.ts").InternalValue,
 *   input: import("./domain.d.ts").InternalValue[],
 * ) => import("./domain.d.ts").InternalValue}
 */
export const applyInternal = (region, target, that, input) => {
  const { naming, "global.Reflect.apply": apply } = region;
  if (isGuestInternalReference(region, target)) {
    const plain = leavePlainExternalReference(region, target);
    const name = getMap(naming, plain);
    const oracle = name && apply_oracle_mapping[name];
    if (oracle) {
      return oracle(region, that, input);
    } else {
      return enterValue(
        region,
        apply(
          plain,
          leaveValue(region, that),
          map(input, (value) => leaveValue(region, value)),
        ),
      );
    }
  } else {
    return applyPlainInternalReference(region, target, that, input);
  }
};

/**
 * @type {(
 *   region: import("./region/region.d.ts").Region,
 *   target: import("./domain.d.ts").InternalReference,
 *   input: import("./domain.d.ts").InternalValue[],
 *   new_target: import("./domain.d.ts").InternalReference,
 * ) => import("./domain.d.ts").InternalReference}
 */
export const constructInternal = (region, target, input, new_target) => {
  const { "global.Reflect.construct": construct } = region;
  if (isGuestInternalReference(region, target)) {
    const plain = leavePlainExternalReference(region, target);
    const name = getMap(region.naming, plain);
    const oracle = name && construct_oracle_mapping[name];
    if (oracle) {
      return oracle(region, input, new_target);
    } else {
      return enterReference(
        region,
        construct(
          plain,
          map(input, (value) => leaveValue(region, value)),
          leaveReference(region, new_target),
        ),
      );
    }
  } else {
    return construct(target, input, new_target);
  }
};

/**
 * @type {(
 *   region: import("./region/region.d.ts").Region,
 *   target: import("./domain.d.ts").InternalReference,
 * ) => boolean}
 */
export const preventInternalExtension = (region, reference) => {
  const { "global.Reflect.preventExtensions": preventExtensions } = region;
  return isGuestInternalReference(region, reference)
    ? preventExtensions(leavePlainExternalReference(region, reference))
    : preventExtensions(reference);
};

/**
 * @type {(
 *   region: import("./region/region.d.ts").Region,
 *   target: import("./domain.d.ts").InternalReference,
 * ) => boolean}
 */
export const isInternalExtensible = (region, reference) => {
  const { "global.Reflect.isExtensible": isExtensible } = region;
  return isGuestInternalReference(region, reference)
    ? isExtensible(leavePlainExternalReference(region, reference))
    : isExtensible(reference);
};

/**
 * @type {(
 *   region: import("./region/region.d.ts").Region,
 *   target: import("./domain.d.ts").InternalReference,
 * ) => import("./domain.d.ts").InternalPrototype}
 */
export const getInternalPrototype = (region, reference) => {
  const { "global.Reflect.getPrototypeOf": getPrototypeOf } = region;
  return isGuestInternalReference(region, reference)
    ? enterPrototype(
        region,
        getPrototypeOf(leavePlainExternalReference(region, reference)),
      )
    : getPrototypeOf(reference);
};

/**
 * @type {(
 *   region: import("./region/region.d.ts").Region,
 *   target: import("./domain.d.ts").InternalReference,
 *   prototype: import("./domain.d.ts").InternalPrototype,
 * ) => boolean}
 */
export const setInternalPrototype = (region, reference, prototype) => {
  const { "global.Reflect.setPrototypeOf": setPrototypeOf } = region;
  return isGuestInternalReference(region, reference)
    ? setPrototypeOf(
        leavePlainExternalReference(region, reference),
        leavePrototype(region, prototype),
      )
    : setPrototypeOf(reference, prototype);
};

/**
 * @type {(
 *   region: import("./region/region.d.ts").Region,
 *   target: import("./domain.d.ts").InternalReference,
 *   key: PropertyKey,
 * ) => boolean}
 */
export const deleteInternalOwnProperty = (region, reference, key) => {
  const { "global.Reflect.deleteProperty": deleteProperty } = region;
  return isGuestInternalReference(region, reference)
    ? deleteProperty(leavePlainExternalReference(region, reference), key)
    : deleteProperty(reference, key);
};

/**
 * @type {(
 *   region: import("./region/region.d.ts").Region,
 *   target: import("./domain.d.ts").InternalReference,
 * ) => (string | symbol)[]}
 */
export const listInternalOwnPropertyKey = (region, reference) => {
  const { "global.Reflect.ownKeys": ownKeys } = region;
  return isGuestInternalReference(region, reference)
    ? ownKeys(leavePlainExternalReference(region, reference))
    : ownKeys(reference);
};

/**
 * @type {(
 *   region: import("./region/region.d.ts").Region,
 *   target: import("./domain.d.ts").InternalReference,
 *   key: PropertyKey,
 * ) => boolean}
 */
export const hasInternalOwnProperty = (region, target, key) => {
  const { "global.Object.hasOwn": hasOwn } = region;
  return isGuestInternalReference(region, target)
    ? hasOwn(leavePlainExternalReference(region, target), key)
    : hasOwn(target, key);
};

/**
 * @type {(
 *   region: import("./region/region.d.ts").Region,
 *   target: import("./domain.d.ts").InternalReference,
 *   property: PropertyKey,
 * ) => undefined | import("./domain.d.ts").InternalDescriptor}
 */
export const getInternalOwnPropertyDescriptor = (region, target, key) => {
  const {
    "global.Reflect.getOwnPropertyDescriptor": getOwnPropertyDescriptor,
  } = region;
  if (isGuestInternalReference(region, target)) {
    const descriptor = getOwnPropertyDescriptor(
      leavePlainExternalReference(region, target),
      key,
    );
    if (descriptor) {
      if (isDataDescriptor(descriptor)) {
        return {
          ...descriptor,
          value: enterValue(region, descriptor.value),
        };
      } else {
        return {
          ...descriptor,
          get: enterAccessor(region, descriptor.get),
          set: enterAccessor(region, descriptor.set),
        };
      }
    } else {
      return descriptor;
    }
  } else {
    if (isPlainInternalArray(target)) {
      if (isNonLengthPropertyKey(key)) {
        return getOwnPropertyDescriptor(target, key);
      } else {
        const descriptor = getOwnPropertyDescriptor(target, "length");
        return {
          ...descriptor,
          value: enterValue(region, descriptor.value),
        };
      }
    } else {
      return getOwnPropertyDescriptor(target, key);
    }
  }
};

/**
 * @type {(
 *   region: import("./region/region.d.ts").Region,
 *   target: import("./domain.d.ts").InternalReference,
 *   key: PropertyKey,
 *   descriptor: import("./domain.d.ts").InternalDefineDescriptor,
 * ) => boolean}
 */
export const defineInternalPropertyDescriptor = (
  region,
  target,
  key,
  descriptor,
) => {
  const { "global.Reflect.defineProperty": defineProperty } = region;
  if (isGuestInternalReference(region, target)) {
    /** @type {import("./domain.d.ts").ExternalDefineDescriptor} */
    const external_descriptor = { __proto__: null };
    if ("writable" in descriptor) {
      external_descriptor.writable = descriptor.writable;
    }
    if ("enumerable" in descriptor) {
      external_descriptor.enumerable = descriptor.enumerable;
    }
    if ("configurable" in descriptor) {
      external_descriptor.configurable = descriptor.configurable;
    }
    if ("value" in descriptor) {
      external_descriptor.value = leaveValue(region, descriptor.value);
    }
    if ("get" in descriptor) {
      external_descriptor.get = leaveAccessor(region, descriptor.get);
    }
    if ("set" in descriptor) {
      external_descriptor.set = leaveAccessor(region, descriptor.set);
    }
    return defineProperty(
      leavePlainExternalReference(region, target),
      key,
      external_descriptor,
    );
  } else {
    return defineOwnPlainInternal(region, target, key, descriptor);
  }
};

/**
 * @type {(
 *   region: import("./region/region.d.ts").Region,
 *   target: import("./domain.d.ts").InternalReference,
 *   key: PropertyKey,
 * ) => boolean}
 */
export const hasInternalProperty = (region, target, key) => {
  const {
    "global.Object.hasOwn": hasOwn,
    "global.Reflect.getPrototypeOf": getPrototypeOf,
    "global.Reflect.has": has,
  } = region;
  while (true) {
    if (isGuestInternalReference(region, target)) {
      // We have to yield to Reflect.has because the target could be a proxy.
      return has(leavePlainExternalReference(region, target), key);
    }
    if (hasOwn(target, key)) {
      return true;
    }
    const prototype = getPrototypeOf(target);
    if (prototype === null) {
      return false;
    }
    target = prototype;
  }
};

/**
 * @type {(
 *   region: import("./region/region.d.ts").Region,
 *   target: import("./domain.d.ts").InternalReference,
 *   key: PropertyKey,
 *   receiver: import("./domain.d.ts").InternalValue,
 * ) => import("./domain.d.ts").InternalValue}
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
  while (true) {
    if (isGuestInternalReference(region, target)) {
      const external = leavePlainExternalReference(region, target);
      if (external === array_prototype || external === object_prototype) {
        const descriptor = getOwnPropertyDescriptor(external, key);
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
              return enterPrimitive(region, undefined);
            }
          }
        }
        const prototype = getPrototypeOf(external);
        if (prototype === null) {
          return enterPrimitive(region, undefined);
        }
        target = enterReference(region, prototype);
      } else {
        // We have to yield to Reflect.get because the target could be a proxy.
        return enterValue(
          region,
          get(
            leavePlainExternalReference(region, target),
            key,
            leaveValue(region, receiver),
          ),
        );
      }
    } else {
      const descriptor = getOwnPlainInternal(region, target, key);
      if (descriptor) {
        if (isDataDescriptor(descriptor)) {
          return descriptor.value;
        } else {
          const { get: getter } = descriptor;
          if (getter) {
            return applyInternal(region, getter, receiver, []);
          } else {
            return enterPrimitive(region, undefined);
          }
        }
      }
      const prototype = getPrototypeOf(target);
      if (prototype === null) {
        return enterPrimitive(region, undefined);
      }
      target = prototype;
    }
  }
};

/**
 * @type {(
 *   region: import("./region/region.d.ts").Region,
 *   target: import("./domain.d.ts").InternalReference,
 *   key: PropertyKey,
 *   value: import("./domain.d.ts").InternalValue,
 *   receiver: import("./domain.d.ts").InternalValue,
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
  while (true) {
    if (isGuestInternalReference(region, target)) {
      const external = leavePlainExternalReference(region, target);
      if (external === array_prototype || external === object_prototype) {
        const descriptor = getOwnPropertyDescriptor(external, key);
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
        const prototype = getPrototypeOf(external);
        if (prototype === null) {
          break;
        }
        target = enterReference(region, prototype);
      } else {
        // We have to yield to Reflect.set because the target could be a proxy.
        return set(
          leavePlainExternalReference(region, target),
          key,
          leaveValue(region, value),
          leaveValue(region, receiver),
        );
      }
    } else {
      const descriptor = getOwnPlainInternal(region, target, key);
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
            applyInternal(region, setter, receiver, [value]);
          }
          return !!setter;
        }
      }
      const prototype = getPrototypeOf(target);
      if (prototype === null) {
        break;
      }
      target = prototype;
    }
  }
  if (isInternalPrimitive(region, receiver)) {
    return false;
  } else {
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
  }
};
