import { hasOwnNarrow, map } from "../util.mjs";
import { isInternalArray, isNonLengthPropertyKey } from "./domain.mjs";
import { isDataDescriptor } from "./descriptor.mjs";

/**
 * @type {(
 *   global: import("./global").Global,
 *   region: import("./region").Region,
 * ) => import("./proxy").ProxyHandler}
 */
export const compileProxyHandler = (
  {
    undefined,
    Object: { hasOwn },
    Reflect: {
      apply,
      construct,
      getPrototypeOf,
      setPrototypeOf,
      defineProperty,
      getOwnPropertyDescriptor,
    },
  },
  {
    leavePlainExternalReference,
    isGuestInternalReference,
    enterValue,
    leaveValue,
    enterAccessor,
    leaveAccessor,
    enterReference,
    leaveReference,
    leavePrototype,
    enterPrototype,
    applyExternalExternal,
    applyInternalExternal,
  },
) => {
  /**
   * @type {(
   *   descriptor: undefined | import("./descriptor").Descriptor<
   *     import("./domain").InternalValue,
   *     import("./domain").InternalReference,
   *   >,
   * ) => undefined | import("./descriptor").Descriptor<
   *   import("./domain").ExternalValue,
   *   import("./domain").ExternalReference,
   * >}
   */
  const toExternalDescriptor = (descriptor) => {
    if (descriptor == null) {
      return descriptor;
    } else {
      if (isDataDescriptor(descriptor)) {
        return {
          ...descriptor,
          value: leaveValue(descriptor.value),
        };
      } else {
        return {
          ...descriptor,
          get: leaveAccessor(descriptor.get),
          set: leaveAccessor(descriptor.set),
        };
      }
    }
  };
  /**
   * @type {(
   *   descriptor: import("./descriptor").DefineDescriptor<
   *     import("./domain").ExternalValue,
   *     import("./domain").ExternalReference,
   *   >,
   * ) => import("./descriptor").DefineDescriptor<
   *   import("./domain").InternalValue,
   *   import("./domain").InternalReference,
   * >}
   */
  const toInternalDescriptor = (descriptor) =>
    /** @type {any} */ ({
      ...descriptor,
      ...(hasOwnNarrow(descriptor, "value")
        ? { value: enterValue(descriptor.value) }
        : null),
      ...(hasOwnNarrow(descriptor, "get")
        ? { get: enterAccessor(descriptor.get) }
        : null),
      ...(hasOwnNarrow(descriptor, "set")
        ? { set: enterAccessor(descriptor.set) }
        : null),
    });
  return {
    apply: (target, that, args) =>
      leaveValue(apply(target, enterValue(that), map(args, enterValue))),
    construct: (target, args, new_target) =>
      leaveReference(
        construct(target, map(args, enterValue), enterReference(new_target)),
      ),
    getPrototypeOf: (target) => leavePrototype(getPrototypeOf(target)),
    setPrototypeOf: (target, prototype) =>
      setPrototypeOf(target, enterPrototype(prototype)),
    defineProperty: (target, key, descriptor) => {
      if (isInternalArray(target)) {
        if (isNonLengthPropertyKey(key)) {
          return defineProperty(target, key, toInternalDescriptor(descriptor));
        } else {
          return defineProperty(target, "length", descriptor);
        }
      } else {
        return defineProperty(target, key, toInternalDescriptor(descriptor));
      }
    },
    getOwnPropertyDescriptor: (target, key) => {
      if (isInternalArray(target)) {
        if (isNonLengthPropertyKey(key)) {
          return toExternalDescriptor(getOwnPropertyDescriptor(target, key));
        } else {
          return getOwnPropertyDescriptor(target, "length");
        }
      } else {
        return toExternalDescriptor(getOwnPropertyDescriptor(target, key));
      }
    },
    has: (target, key) => {
      /** @type {import("./domain").InternalPrototype} */
      let internal = target;
      while (internal !== null) {
        if (isGuestInternalReference(internal)) {
          const external = leavePlainExternalReference(internal);
          if (hasOwn(external, key)) {
            return true;
          }
          internal = enterPrototype(getPrototypeOf(external));
        } else {
          if (hasOwn(internal, key)) {
            return true;
          }
          internal = getPrototypeOf(internal);
        }
      }
      return false;
    },
    get: (target, key, receiver) => {
      /** @type {import("./domain").InternalPrototype} */
      let internal = target;
      while (internal !== null) {
        if (isGuestInternalReference(internal)) {
          const external = leavePlainExternalReference(internal);
          const descriptor = getOwnPropertyDescriptor(external, key);
          if (descriptor) {
            if (isDataDescriptor(descriptor)) {
              return descriptor.value;
            } else {
              const { get } = descriptor;
              return get == null
                ? undefined
                : applyExternalExternal(get, receiver, []);
            }
          } else {
            internal = enterPrototype(getPrototypeOf(external));
            continue;
          }
        } else {
          if (isInternalArray(internal)) {
            if (isNonLengthPropertyKey(key)) {
              const descriptor = getOwnPropertyDescriptor(internal, key);
              if (descriptor) {
                if (isDataDescriptor(descriptor)) {
                  return leaveValue(descriptor.value);
                } else {
                  const { get } = descriptor;
                  return get == null
                    ? undefined
                    : applyInternalExternal(get, receiver, []);
                }
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
              if (isDataDescriptor(descriptor)) {
                return leaveValue(descriptor.value);
              } else {
                const { get } = descriptor;
                return get == null
                  ? undefined
                  : applyInternalExternal(get, receiver, []);
              }
            } else {
              internal = getPrototypeOf(internal);
              continue;
            }
          }
        }
      }
      return undefined;
    },
    set: (target, key, value, receiver) => {
      /** @type {import("./domain").InternalPrototype} */
      let internal = target;
      while (internal !== null) {
        if (isGuestInternalReference(internal)) {
          const external = leavePlainExternalReference(internal);
          const descriptor = getOwnPropertyDescriptor(external, key);
          if (descriptor) {
            if (isDataDescriptor(descriptor)) {
              break;
            } else {
              const { set } = descriptor;
              if (set != null) {
                applyExternalExternal(set, receiver, [value]);
              }
              return set != null;
            }
          } else {
            internal = enterPrototype(getPrototypeOf(external));
            continue;
          }
        } else {
          if (isInternalArray(internal)) {
            if (isNonLengthPropertyKey(key)) {
              const descriptor = getOwnPropertyDescriptor(internal, key);
              if (descriptor) {
                if (isDataDescriptor(descriptor)) {
                  break;
                } else {
                  const { set } = descriptor;
                  if (set != null) {
                    applyInternalExternal(set, receiver, [value]);
                  }
                  return set != null;
                }
              } else {
                internal = getPrototypeOf(internal);
                continue;
              }
            } else {
              break;
            }
          } else {
            const descriptor = getOwnPropertyDescriptor(internal, key);
            if (descriptor) {
              if (isDataDescriptor(descriptor)) {
                break;
              } else {
                const { set } = descriptor;
                if (set != null) {
                  applyInternalExternal(set, receiver, [value]);
                }
                return set != null;
              }
            } else {
              internal = getPrototypeOf(internal);
              continue;
            }
          }
        }
      }
      if (isInternalArray(target)) {
        if (isNonLengthPropertyKey(key)) {
          return defineProperty(target, key, {
            __proto__: null,
            writable: true,
            enumerable: true,
            configurable: true,
            ...getOwnPropertyDescriptor(target, key),
            value: enterValue(value),
          });
        } else {
          return defineProperty(target, "length", {
            __proto__: null,
            ...getOwnPropertyDescriptor(target, "length"),
            value,
          });
        }
      } else {
        return defineProperty(target, key, {
          __proto__: null,
          writable: true,
          enumerable: true,
          configurable: true,
          ...getOwnPropertyDescriptor(target, key),
          value: enterValue(value),
        });
      }
    },
  };
};
