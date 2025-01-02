import { isDataDescriptor } from "../../descriptor.mjs";
import {
  isInternalArray,
  isNonLengthPropertyKey,
  toPropertyKey,
} from "../../domain.mjs";

/** @type {import("../oracle").CompileOracleEntry} */
export default ({
  global: {
    Reflect: { set, defineProperty, getPrototypeOf, getOwnPropertyDescriptor },
  },
  region: {
    enterPrototype,
    atInternal,
    atExternal,
    isGuestInternalReference,
    leaveValue,
    leavePlainExternalReference,
    enterPrimitive,
    isInternalPrimitive,
    leavePrimitive,
    applyExternalInternal,
    applyInternalInternal,
  },
}) => [
  set,
  {
    apply: (_that, args) => {
      const target = atInternal(args, 0);
      const key = toPropertyKey(atExternal(args, 1));
      const value = atInternal(args, 2);
      const receiver = args.length < 4 ? target : args[3];
      if (isInternalPrimitive(target)) {
        return set(leavePrimitive(target), key, value, receiver);
      } else {
        /** @type {import("../../domain").InternalPrototype} */
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
                return enterPrimitive(set != null);
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
                    return enterPrimitive(set != null);
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
                  return enterPrimitive(set != null);
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
          return enterPrimitive(
            defineProperty(external, key, {
              __proto__: null,
              writable: true,
              enumerable: true,
              configurable: true,
              ...getOwnPropertyDescriptor(external, key),
              value: leaveValue(value),
            }),
          );
        } else {
          if (isInternalArray(target)) {
            if (isNonLengthPropertyKey(key)) {
              return enterPrimitive(
                defineProperty(target, key, {
                  __proto__: null,
                  writable: true,
                  enumerable: true,
                  configurable: true,
                  ...getOwnPropertyDescriptor(target, key),
                  value,
                }),
              );
            } else {
              return enterPrimitive(
                defineProperty(target, "length", {
                  __proto__: null,
                  ...getOwnPropertyDescriptor(target, "length"),
                  value: leaveValue(value),
                }),
              );
            }
          } else {
            return enterPrimitive(
              defineProperty(target, key, {
                __proto__: null,
                writable: true,
                enumerable: true,
                configurable: true,
                ...getOwnPropertyDescriptor(target, key),
                value,
              }),
            );
          }
        }
      }
    },
    construct: null,
  },
];
