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
  enterAccessor,
  enterPrototype,
  enterReference,
  enterValue,
  leaveAccessor,
  leavePrototype,
  leaveReference,
  leaveValue,
} from "./region/util.mjs";

// TODO: target should be a function before converting input:
//
// > Reflect.apply({}, undefined, "illegal-argument-list")
// Uncaught:
// TypeError: Function.prototype.apply was called on #<Object>,
//   which is an object and not a function

/**
 * @type {(
 *   region: import("./region/region").Region,
 *   target: import("./domain").InternalReference,
 *   that: import("./domain").InternalValue,
 *   input: import("./domain").InternalValue[],
 * ) => import("./domain").InternalValue}
 */
export const applyInternal = (region, target, that, input) => {
  const {
    naming,
    global: {
      Reflect: { apply },
    },
  } = region;
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
 *   region: import("./region/region").Region,
 *   target: import("./domain").InternalReference,
 *   input: import("./domain").InternalValue[],
 *   new_target: import("./domain").InternalReference,
 * ) => import("./domain").InternalReference}
 */
export const constructInternal = (region, target, input, new_target) => {
  const {
    global: {
      Reflect: { construct },
    },
  } = region;
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
 *   region: import("./region/region").Region,
 *   target: import("./domain").InternalReference,
 * ) => boolean}
 */
export const preventInternalExtension = (region, reference) => {
  const {
    global: {
      Reflect: { preventExtensions },
    },
  } = region;
  return isGuestInternalReference(region, reference)
    ? preventExtensions(leavePlainExternalReference(region, reference))
    : preventExtensions(reference);
};

/**
 * @type {(
 *   region: import("./region/region").Region,
 *   target: import("./domain").InternalReference,
 * ) => boolean}
 */
export const isInternalExtensible = (region, reference) => {
  const {
    global: {
      Reflect: { isExtensible },
    },
  } = region;
  return isGuestInternalReference(region, reference)
    ? isExtensible(leavePlainExternalReference(region, reference))
    : isExtensible(reference);
};

/**
 * @type {(
 *   region: import("./region/region").Region,
 *   target: import("./domain").InternalReference,
 * ) => import("./domain").InternalPrototype}
 */
export const getInternalPrototype = (region, reference) => {
  const {
    global: {
      Reflect: { getPrototypeOf },
    },
  } = region;
  return isGuestInternalReference(region, reference)
    ? enterPrototype(
        region,
        getPrototypeOf(leavePlainExternalReference(region, reference)),
      )
    : getPrototypeOf(reference);
};

/**
 * @type {(
 *   region: import("./region/region").Region,
 *   target: import("./domain").InternalReference,
 *   prototype: import("./domain").InternalPrototype,
 * ) => boolean}
 */
export const setInternalPrototype = (region, reference, prototype) => {
  const {
    global: {
      Reflect: { setPrototypeOf },
    },
  } = region;
  return isGuestInternalReference(region, reference)
    ? setPrototypeOf(
        leavePlainExternalReference(region, reference),
        leavePrototype(region, prototype),
      )
    : setPrototypeOf(reference, prototype);
};

/**
 * @type {(
 *   region: import("./region/region").Region,
 *   target: import("./domain").InternalReference,
 *   key: PropertyKey,
 * ) => boolean}
 */
export const deleteInternalProperty = (region, reference, key) => {
  const {
    global: {
      Reflect: { deleteProperty },
    },
  } = region;
  return isGuestInternalReference(region, reference)
    ? deleteProperty(leavePlainExternalReference(region, reference), key)
    : deleteProperty(reference, key);
};

/**
 * @type {(
 *   region: import("./region/region").Region,
 *   target: import("./domain").InternalReference,
 * ) => (string | symbol)[]}
 */
export const listInternalProperty = (region, reference) => {
  const {
    global: {
      Reflect: { ownKeys },
    },
  } = region;
  return isGuestInternalReference(region, reference)
    ? ownKeys(leavePlainExternalReference(region, reference))
    : ownKeys(reference);
};

/**
 * @type {(
 *   region: import("./region/region").Region,
 *   target: import("./domain").InternalReference,
 *   key: PropertyKey,
 * ) => boolean}
 */
export const hasInternalProperty = (region, target, key) => {
  const {
    global: {
      Object: { hasOwn },
    },
  } = region;
  return isGuestInternalReference(region, target)
    ? hasOwn(leavePlainExternalReference(region, target), key)
    : hasOwn(target, key);
};

/**
 * @type {(
 *   region: import("./region/region").Region,
 *   target: import("./domain").InternalReference,
 *   property: PropertyKey,
 * ) => undefined | import("./domain").InternalDescriptor}
 */
export const getInternalProperty = (region, target, key) => {
  const {
    global: {
      Reflect: { getOwnPropertyDescriptor },
    },
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
 *   region: import("./region/region").Region,
 *   target: import("./domain").InternalReference,
 *   key: PropertyKey,
 *   descriptor: import("./domain").InternalDefineDescriptor,
 * ) => boolean}
 */
export const defineInternalProperty = (region, target, key, descriptor) => {
  const {
    global: {
      Reflect: { defineProperty },
    },
  } = region;
  if (isGuestInternalReference(region, target)) {
    return defineProperty(
      leavePlainExternalReference(region, target),
      key,
      /**
       * @type {import("./domain").Descriptor<
       *   import("./domain").ExternalValue,
       *   import("./domain").ExternalReference
       * >}
       */ ({
        __proto__: null,
        ...descriptor,
        ...("value" in descriptor
          ? { value: leaveValue(region, descriptor.value) }
          : null),
        ...("get" in descriptor
          ? { get: leaveAccessor(region, descriptor.get) }
          : null),
        ...("set" in descriptor
          ? { set: leaveAccessor(region, descriptor.set) }
          : null),
      }),
    );
  } else {
    if (isPlainInternalArray(target)) {
      if (isNonLengthPropertyKey(key)) {
        return defineProperty(target, key, descriptor);
      } else {
        return defineProperty(
          target,
          "length",
          /**
           * @type {import("./domain").Descriptor<
           *   import("./domain").ExternalValue,
           *   import("./domain").ExternalReference
           * >}
           */ ({
            __proto__: null,
            ...descriptor,
            ...("value" in descriptor
              ? { value: leaveValue(region, descriptor.value) }
              : null),
            ...("get" in descriptor
              ? { get: leaveAccessor(region, descriptor.get) }
              : null),
            ...("set" in descriptor
              ? { set: leaveAccessor(region, descriptor.set) }
              : null),
          }),
        );
      }
    } else {
      return defineProperty(target, key, descriptor);
    }
  }
};

/**
 * @type {(
 *   region: import("./region/region").Region,
 *   target: import("./domain").InternalReference,
 *   key: PropertyKey,
 * ) => boolean}
 */
export const hasInternal = (region, target, key) => {
  /** @type {import("./domain").InternalPrototype} */
  let current = target;
  while (current !== null) {
    if (hasInternalProperty(region, current, key)) {
      return true;
    }
    current = getInternalPrototype(region, current);
  }
  return false;
};

/**
 * @type {(
 *   region: import("./region/region").Region,
 *   target: import("./domain").InternalReference,
 *   key: PropertyKey,
 *   receiver: import("./domain").InternalValue,
 * ) => import("./domain").InternalValue}
 */
export const getInternal = (region, target, key, receiver) => {
  const {
    global: { undefined },
  } = region;
  /** @type {import("./domain").InternalPrototype} */
  let current = target;
  while (current !== null) {
    const descriptor = getInternalProperty(region, current, key);
    if (descriptor) {
      if (isDataDescriptor(descriptor)) {
        return descriptor.value;
      } else {
        const { get } = descriptor;
        if (get) {
          return applyInternal(region, get, receiver, []);
        } else {
          return enterPrimitive(region, undefined);
        }
      }
    }
    current = getInternalPrototype(region, current);
  }
  return enterPrimitive(region, undefined);
};

/**
 * @type {(
 *   region: import("./region/region").Region,
 *   target: import("./domain").InternalReference,
 *   key: PropertyKey,
 *   value: import("./domain").InternalValue,
 *   receiver: import("./domain").InternalValue,
 * ) => boolean}
 */
export const setInternal = (region, target, key, value, receiver) => {
  /** @type {import("./domain").InternalPrototype} */
  let current = target;
  while (current !== null) {
    const descriptor = getInternalProperty(region, current, key);
    if (descriptor) {
      if (isDataDescriptor(descriptor)) {
        break;
      } else {
        const { set } = descriptor;
        if (set) {
          applyInternal(region, set, receiver, [value]);
        }
        return !!set;
      }
    }
    current = getInternalPrototype(region, current);
  }
  if (isInternalPrimitive(region, receiver)) {
    return false;
  } else {
    const descriptor = getInternalProperty(region, receiver, key);
    if (descriptor) {
      if (isDataDescriptor(descriptor)) {
        if (descriptor.writable) {
          return defineInternalProperty(region, receiver, key, {
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
      return defineInternalProperty(region, target, key, {
        __proto__: null,
        writable: true,
        configurable: true,
        enumerable: true,
        value,
      });
    }
  }
};
