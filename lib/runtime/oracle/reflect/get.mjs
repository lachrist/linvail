import { isDataDescriptor } from "../../descriptor.mjs";
import {
  isInternalArray,
  isNonLengthPropertyKey,
  toPropertyKey,
} from "../../domain.mjs";

/** @type {import("../oracle").CompileOracleEntry} */
export default ({
  global: {
    undefined,
    Reflect: { get, getPrototypeOf, getOwnPropertyDescriptor },
  },
  region: {
    enterPrototype,
    atInternal,
    atExternal,
    isGuestInternalReference,
    enterValue,
    leavePlainExternalReference,
    enterPrimitive,
    isInternalPrimitive,
    leavePrimitive,
    applyExternalInternal,
    applyInternalInternal,
  },
}) => [
  /** @type {any} */ (get),
  {
    apply: (_that, args) => {
      const target = atInternal(args, 0);
      const key = toPropertyKey(atExternal(args, 1));
      const receiver = args.length < 3 ? target : args[2];
      if (isInternalPrimitive(target)) {
        return get(leavePrimitive(target), key, receiver);
      } else {
        /** @type {import("../../domain").InternalPrototype} */
        let internal = target;
        while (internal !== null) {
          if (isGuestInternalReference(internal)) {
            const external = leavePlainExternalReference(internal);
            const descriptor = getOwnPropertyDescriptor(external, key);
            if (descriptor) {
              if (isDataDescriptor(descriptor)) {
                return enterValue(descriptor.value);
              } else {
                const { get } = descriptor;
                return get != null
                  ? applyExternalInternal(get, receiver, [])
                  : enterPrimitive(undefined);
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
                    return descriptor.value;
                  } else {
                    const { get } = descriptor;
                    return get != null
                      ? applyInternalInternal(get, receiver, [])
                      : enterPrimitive(undefined);
                  }
                } else {
                  internal = getPrototypeOf(internal);
                  continue;
                }
              } else {
                return enterValue(
                  getOwnPropertyDescriptor(internal, "length").value,
                );
              }
            } else {
              const descriptor = getOwnPropertyDescriptor(internal, key);
              if (descriptor) {
                if (isDataDescriptor(descriptor)) {
                  return descriptor.value;
                } else {
                  const { get } = descriptor;
                  return get != null
                    ? applyInternalInternal(get, receiver, [])
                    : enterPrimitive(undefined);
                }
              } else {
                internal = getPrototypeOf(internal);
                continue;
              }
            }
          }
        }
        return enterPrimitive(undefined);
      }
    },
    construct: null,
  },
];
