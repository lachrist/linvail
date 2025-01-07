import {
  isDataDescriptor,
  isInternalArray,
  isNonLengthPropertyKey,
} from "../domain.mjs";

/**
 * @type {(
 *   global: import("../global").Global,
 *   region: import("../region/region").Region,
 * ) => import("./reflect").PrimaryReflect}
 */
const compilePrimaryReflect = (
  {
    Object: { hasOwn },
    Reflect: {
      preventExtensions,
      isExtensible,
      getPrototypeOf,
      setPrototypeOf,
      defineProperty,
      getOwnPropertyDescriptor,
      deleteProperty,
      ownKeys,
    },
  },
  {
    isGuestInternalReference,
    leavePlainExternalReference,
    enterValue,
    leaveValue,
    enterPrototype,
    leavePrototype,
    enterAccessor,
    leaveAccessor,
  },
) => ({
  hasOwn: (target, key) =>
    isGuestInternalReference(target)
      ? hasOwn(leavePlainExternalReference(target), key)
      : hasOwn(target, key),
  preventExtensions: (target) =>
    isGuestInternalReference(target)
      ? preventExtensions(leavePlainExternalReference(target))
      : preventExtensions(target),
  isExtensible: (target) =>
    isGuestInternalReference(target)
      ? isExtensible(leavePlainExternalReference(target))
      : isExtensible(target),
  getPrototypeOf: (target) =>
    isGuestInternalReference(target)
      ? enterPrototype(getPrototypeOf(leavePlainExternalReference(target)))
      : getPrototypeOf(target),
  setPrototypeOf: (target, prototype) =>
    isGuestInternalReference(target)
      ? setPrototypeOf(
          leavePlainExternalReference(target),
          leavePrototype(prototype),
        )
      : setPrototypeOf(target, prototype),
  getOwnPropertyDescriptor: (target, key) => {
    if (isGuestInternalReference(target)) {
      const descriptor = getOwnPropertyDescriptor(
        leavePlainExternalReference(target),
        key,
      );
      if (descriptor) {
        if (isDataDescriptor(descriptor)) {
          return {
            ...descriptor,
            value: enterValue(descriptor.value),
          };
        } else {
          return {
            ...descriptor,
            get: enterAccessor(descriptor.get),
            set: enterAccessor(descriptor.set),
          };
        }
      } else {
        return descriptor;
      }
    } else {
      if (isInternalArray(target)) {
        if (isNonLengthPropertyKey(key)) {
          return getOwnPropertyDescriptor(target, key);
        } else {
          const descriptor = getOwnPropertyDescriptor(target, "length");
          return {
            ...descriptor,
            value: enterValue(descriptor.value),
          };
        }
      } else {
        return getOwnPropertyDescriptor(target, key);
      }
    }
  },
  defineProperty: (target, key, descriptor) => {
    if (isGuestInternalReference(target)) {
      return defineProperty(
        leavePlainExternalReference(target),
        key,
        /**
         * @type {import("../domain").Descriptor<
         *   import("../domain").ExternalValue,
         *   import("../domain").ExternalReference
         * >}
         */ ({
          __proto__: null,
          ...descriptor,
          ...("value" in descriptor
            ? { value: leaveValue(descriptor.value) }
            : null),
          ...("get" in descriptor
            ? { get: leaveAccessor(descriptor.get) }
            : null),
          ...("set" in descriptor
            ? { set: leaveAccessor(descriptor.set) }
            : null),
        }),
      );
    } else {
      if (isInternalArray(target)) {
        if (isNonLengthPropertyKey(key)) {
          return defineProperty(target, key, descriptor);
        } else {
          return defineProperty(
            target,
            "length",
            /**
             * @type {import("../domain").Descriptor<
             *   import("../domain").ExternalValue,
             *   import("../domain").ExternalReference
             * >}
             */ ({
              __proto__: null,
              ...descriptor,
              ...("value" in descriptor
                ? { value: leaveValue(descriptor.value) }
                : null),
              ...("get" in descriptor
                ? { get: leaveAccessor(descriptor.get) }
                : null),
              ...("set" in descriptor
                ? { set: leaveAccessor(descriptor.set) }
                : null),
            }),
          );
        }
      } else {
        return defineProperty(target, key, descriptor);
      }
    }
  },
  deleteProperty: (target, key) =>
    isGuestInternalReference(target)
      ? deleteProperty(leavePlainExternalReference(target), key)
      : deleteProperty(target, key),
  ownKeys: (target) =>
    isGuestInternalReference(target)
      ? ownKeys(leavePlainExternalReference(target))
      : ownKeys(target),
});

/**
 * @type {(
 *   global: import("../global").Global,
 *   region: import("../region/region").Region,
 *   closure_reflect: import("./reflect").ClosureReflect,
 *   primary_reflect: import("./reflect").PrimaryReflect,
 * ) => import("./reflect").SecondaryReflect}
 */
const compileSecondaryReflect = (
  { undefined },
  { enterPrimitive },
  { apply },
  { hasOwn, getPrototypeOf, getOwnPropertyDescriptor, defineProperty },
) => ({
  has: (target, key) => {
    /** @type {import("../domain").InternalPrototype} */
    let current = target;
    while (current !== null) {
      if (hasOwn(current, key)) {
        return true;
      }
      current = getPrototypeOf(current);
    }
    return false;
  },
  get: (target, key, receiver) => {
    /** @type {import("../domain").InternalPrototype} */
    let current = target;
    while (current !== null) {
      const descriptor = getOwnPropertyDescriptor(current, key);
      if (descriptor) {
        if (isDataDescriptor(descriptor)) {
          return descriptor.value;
        } else {
          const { get } = descriptor;
          if (get) {
            return apply(get, receiver, []);
          } else {
            return enterPrimitive(undefined);
          }
        }
      }
      current = getPrototypeOf(current);
    }
    return enterPrimitive(undefined);
  },
  set: (target, key, value, receiver) => {
    /** @type {import("../domain").InternalPrototype} */
    let current = target;
    while (current !== null) {
      const descriptor = getOwnPropertyDescriptor(current, key);
      if (descriptor) {
        if (isDataDescriptor(descriptor)) {
          break;
        } else {
          const { set } = descriptor;
          if (set) {
            apply(set, receiver, [value]);
          }
          return !!set;
        }
      }
      current = getPrototypeOf(current);
    }
    return defineProperty(target, key, {
      ...getOwnPropertyDescriptor(target, key),
      value,
    });
  },
});

/**
 * @type {(
 *   global: import("../global").Global,
 *   region: import("../region/region").Region,
 *   closure_reflect: import("./reflect").ClosureReflect,
 * ) => import("./reflect").Reflect}
 */
export const compileReflect = (global, region, closure_reflect) => {
  const primary_reflect = compilePrimaryReflect(global, region);
  const secondary_reflect = compileSecondaryReflect(
    global,
    region,
    closure_reflect,
    primary_reflect,
  );
  return {
    ...closure_reflect,
    ...primary_reflect,
    ...secondary_reflect,
  };
};
