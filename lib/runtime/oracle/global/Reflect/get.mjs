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
 *   receiver: import("../../../domain").InternalValue,
 * ) => import("../../../domain").InternalValue}
 */
export const compileGet =
  ({
    global: {
      undefined,
      Reflect: { getPrototypeOf, getOwnPropertyDescriptor },
    },
    region: {
      enterPrototype,
      isGuestInternalReference,
      enterValue,
      leavePlainExternalReference,
      enterPrimitive,
      applyExternalInternal,
      applyInternalInternal,
    },
  }) =>
  (target, key, receiver) => {
    /** @type {import("../../../domain").InternalPrototype} */
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
  };

/** @type {import("../../oracle").CompileOracleEntry} */
export default ({
  get,
  global: {
    TypeError,
    Reflect: { get: callee },
  },
  region: { atInternal, atExternal, isInternalPrimitive },
}) => [
  /** @type {any} */ (callee),
  {
    apply: (_that, args) => {
      const target = atInternal(args, 0);
      if (isInternalPrimitive(target)) {
        throw new TypeError("Reflect.get called with non-object target");
      } else {
        const key = toPropertyKey(atExternal(args, 1));
        const receiver = args.length < 3 ? target : args[2];
        return get(target, key, receiver);
      }
    },
    construct: null,
  },
];
