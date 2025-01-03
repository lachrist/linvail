import { isDataDescriptor } from "../../../descriptor.mjs";
import {
  isInternalArray,
  isNonLengthPropertyKey,
  toPropertyKey,
} from "../../../domain.mjs";

/**
 * @type {(
 *   context: {
 *     global: import("../../../global").Global,
 *     region: import("../../../region").Region,
 *   },
 * ) => (
 *   target: import("../../../domain").InternalReference,
 *   key: PropertyKey,
 *   value: import("../../../domain").InternalValue,
 *   receiver: import("../../../domain").InternalValue,
 * ) => boolean}
 */
export const compileSet =
  ({
    global: {
      Reflect: { defineProperty, getPrototypeOf, getOwnPropertyDescriptor },
    },
    region: {
      enterPrototype,
      isGuestInternalReference,
      leaveValue,
      leavePlainExternalReference,
      applyExternalInternal,
      applyInternalInternal,
    },
  }) =>
  (target, key, value, receiver) => {
    /** @type {import("../../../domain").InternalPrototype} */
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
              applyExternalInternal(set, receiver, [value]);
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
                  applyInternalInternal(set, receiver, [value]);
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
                applyInternalInternal(set, receiver, [value]);
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
    if (isGuestInternalReference(target)) {
      const external = leavePlainExternalReference(target);
      return defineProperty(external, key, {
        __proto__: null,
        writable: true,
        enumerable: true,
        configurable: true,
        ...getOwnPropertyDescriptor(external, key),
        value: leaveValue(value),
      });
    } else {
      if (isInternalArray(target)) {
        if (isNonLengthPropertyKey(key)) {
          return defineProperty(target, key, {
            __proto__: null,
            writable: true,
            enumerable: true,
            configurable: true,
            ...getOwnPropertyDescriptor(target, key),
            value,
          });
        } else {
          return defineProperty(target, "length", {
            __proto__: null,
            ...getOwnPropertyDescriptor(target, "length"),
            value: leaveValue(value),
          });
        }
      } else {
        return defineProperty(target, key, {
          __proto__: null,
          writable: true,
          enumerable: true,
          configurable: true,
          ...getOwnPropertyDescriptor(target, key),
          value,
        });
      }
    }
  };

/** @type {import("../../oracle").CompileOracleEntry} */
export default ({
  set,
  global: {
    TypeError,
    Reflect: { set: callee },
  },
  region: { atInternal, atExternal, enterPrimitive, isInternalPrimitive },
}) => [
  callee,
  {
    apply: (_that, args) => {
      const target = atInternal(args, 0);
      if (isInternalPrimitive(target)) {
        throw new TypeError("Reflect.set called with non-object target");
      } else {
        const key = toPropertyKey(atExternal(args, 1));
        const value = atInternal(args, 2);
        const receiver = args.length < 4 ? target : args[3];
        return enterPrimitive(set(target, key, value, receiver));
      }
    },
    construct: null,
  },
];
