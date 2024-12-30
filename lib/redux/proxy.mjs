import { isPrimitive, map } from "../util.mjs";
import { isInternalArray } from "./domain.mjs";
import { isDataDescriptor } from "./descriptor.mjs";

const {
  undefined,
  Object: { hasOwn },
} = globalThis;

/**
 * @type {(
 *   key: PropertyKey,
 * ) => key is import("./reflect").NonLengthPropertyKey}
 */
const isNonLengthPropertyKey = (key) => key !== "length";

/**
 * @type {(
 *   target: (
 *     | import("./domain").PlainInternalReference
 *     | import("./domain").PlainExternalReference
 *   ),
 *   key: import("./domain").ExternalValue,
 * ) => boolean}
 */
const hasOwnReflect = /** @type {any} */ (hasOwn);

/**
 * @type {<O extends {[k in K]?: V}, K extends PropertyKey, V>(
 *   target: O,
 *   key: K,
 * ) => target is O & {[k in K]: V}}
 */
const hasOwnNarrow = /** @type {any} */ (hasOwn);

/**
 * @type {(
 *   Reflect: import("./reflect").Reflect,
 *   region: import("./region").Region,
 * ) => import("./proxy").ProxyHandler}
 */
export const compileProxyHandler = (
  {
    apply,
    construct,
    getPrototypeOf,
    setPrototypeOf,
    defineProperty,
    getOwnPropertyDescriptor,
  },
  region,
) => {
  const {
    isInternalPrimitive,
    toInternalPrimitive,
    toExternalPrimitive,
    isGuestExternalReference,
    toPlainInternalReference,
    toGuestInternalReference,
    isGuestInternalReference,
    toGuestExternalReference,
    toPlainExternalReference,
  } = region;
  /**
   * @type {(
   *   value: import("./domain").ExternalReference,
   * ) => import("./domain").InternalReference}
   */
  const enterReference = (reference) =>
    isGuestExternalReference(reference)
      ? toPlainInternalReference(reference)
      : toGuestInternalReference(reference);
  /**
   * @type {(
   *   value: import("./domain").InternalReference,
   * ) => import("./domain").ExternalReference}
   */
  const leaveReference = (reference) =>
    isGuestInternalReference(reference)
      ? toPlainExternalReference(reference)
      : toGuestExternalReference(reference);
  /**
   * @type {(
   *   value: import("./domain").ExternalValue,
   * ) => import("./domain").InternalValue}
   */
  const enterValue = (value) =>
    isPrimitive(value)
      ? toInternalPrimitive(value, true)
      : enterReference(value);
  /**
   * @type {(
   *   value: import("./domain").InternalValue,
   * ) => import("./domain").ExternalValue}
   */
  const leaveValue = (value) =>
    isInternalPrimitive(value)
      ? toExternalPrimitive(value, true)
      : leaveReference(value);
  /**
   * @type {(
   *   accessor: undefined | import("./domain").ExternalReference,
   * ) => undefined | import("./domain").InternalReference}
   */
  const enterAccessor = (value) =>
    value == null ? value : enterReference(value);
  /**
   * @type {(
   *   accessor: undefined | import("./domain").InternalReference,
   * ) => undefined | import("./domain").ExternalReference}
   */
  const leaveAccessor = (value) =>
    value == null ? value : leaveReference(value);
  /**
   * @type {(
   *   prototype: import("./reflect").ExternalPrototype,
   * ) => import("./reflect").InternalPrototype}
   */
  const enterPrototype = (prototype) =>
    prototype === null ? null : enterReference(prototype);
  /**
   * @type {(
   *   prototype: import("./reflect").InternalPrototype,
   * ) => import("./reflect").ExternalPrototype}
   */
  const leavePrototype = (prototype) =>
    prototype === null ? null : leaveReference(prototype);
  /**
   * @type {(
   *   descriptor: import("./descriptor").Descriptor<
   *     import("./domain").InternalValue,
   *     import("./domain").InternalReference
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
        if (isGuestInternalReference(get)) {
          return apply(toPlainExternalReference(get), receiver, []);
        } else {
          return leaveValue(apply(get, enterValue(receiver), []));
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
        if (isGuestExternalReference(get)) {
          return leaveValue(
            apply(toPlainInternalReference(get), enterValue(receiver), []),
          );
        } else {
          return apply(get, receiver, []);
        }
      }
    }
  };
  /**
   * @type {(
   *   descriptor: import("./descriptor").AccessorDescriptor<
   *     import("./domain").InternalReference
   *   >,
   *   value: import("./domain").ExternalValue,
   *   receiver: import("./domain").ExternalValue,
   * ) => boolean}
   */
  const setInternalDescriptor = (descriptor, value, receiver) => {
    const { set } = descriptor;
    if (set == null) {
      return false;
    } else {
      if (isGuestInternalReference(set)) {
        apply(toPlainExternalReference(set), receiver, [value]);
      } else {
        apply(set, enterValue(receiver), [enterValue(value)]);
      }
      return true;
    }
  };
  /**
   * @type {(
   *   descriptor: import("./descriptor").AccessorDescriptor<
   *     import("./domain").ExternalReference
   *   >,
   *   value: import("./domain").ExternalValue,
   *   receiver: import("./domain").ExternalValue,
   * ) => boolean}
   */
  const setExternalDescriptor = (descriptor, value, receiver) => {
    const { set } = descriptor;
    if (set == null) {
      return false;
    } else {
      if (isGuestExternalReference(set)) {
        apply(toPlainInternalReference(set), enterValue(receiver), [
          enterValue(value),
        ]);
      } else {
        apply(set, receiver, [value]);
      }
      return true;
    }
  };
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
        construct(
          target,
          map(args, enterValue),
          isGuestExternalReference(new_target)
            ? toPlainInternalReference(new_target)
            : toGuestInternalReference(new_target),
        ),
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
      /**
       * @type {import("./reflect").InternalPrototype}
       */
      let internal = target;
      while (internal !== null) {
        if (isGuestInternalReference(internal)) {
          const external = toPlainExternalReference(internal);
          if (hasOwnReflect(external, key)) {
            return true;
          }
          internal = enterPrototype(getPrototypeOf(external));
        } else {
          if (hasOwnReflect(internal, key)) {
            return true;
          }
          internal = getPrototypeOf(internal);
        }
      }
      return false;
    },
    get: (target, key, receiver) => {
      /**
       * @type {import("./reflect").InternalPrototype}
       */
      let internal = target;
      while (internal !== null) {
        if (isGuestInternalReference(internal)) {
          const external = toPlainExternalReference(internal);
          const descriptor = getOwnPropertyDescriptor(external, key);
          if (descriptor) {
            return getExternalDescriptor(descriptor, receiver);
          } else {
            internal = enterPrototype(getPrototypeOf(external));
            continue;
          }
        } else {
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
        }
      }
      return undefined;
    },
    set: (target, key, value, receiver) => {
      /**
       * @type {import("./reflect").InternalPrototype}
       */
      let internal = target;
      while (internal !== null) {
        if (isGuestInternalReference(internal)) {
          const external = toPlainExternalReference(internal);
          const descriptor = getOwnPropertyDescriptor(external, key);
          if (descriptor) {
            if (isDataDescriptor(descriptor)) {
              break;
            } else {
              return setExternalDescriptor(descriptor, value, receiver);
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
                  return setInternalDescriptor(descriptor, value, receiver);
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
                return setInternalDescriptor(descriptor, value, receiver);
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
