import { toPropertyKey } from "../../../domain.mjs";

/**
 * @type {(
 *   context: {
 *     global: import("../../../global").Global,
 *     region: import("../../../region").Region,
 *   },
 * ) => (
 *   target: import("../../../domain").InternalReference,
 *   key: PropertyKey,
 * ) => boolean}
 */
export const compileHas =
  ({
    global: {
      Object: { hasOwn },
      Reflect: { getPrototypeOf },
    },
    region: {
      isGuestInternalReference,
      enterPrototype,
      leavePlainExternalReference,
    },
  }) =>
  (target, key) => {
    /** @type {import("../../../domain").InternalPrototype} */
    let internal = target;
    while (internal !== null) {
      if (isGuestInternalReference(internal)) {
        const external = leavePlainExternalReference(internal);
        if (hasOwn(external, key)) {
          return true;
        } else {
          internal = enterPrototype(getPrototypeOf(external));
          continue;
        }
      } else {
        if (hasOwn(internal, key)) {
          return true;
        } else {
          continue;
        }
      }
    }
    return false;
  };

/** @type {import("../../oracle").CompileOracleEntry} */
export default ({
  has,
  global: {
    TypeError,
    Reflect: { has: callee },
  },
  region: { isInternalPrimitive, atInternal, atExternal, enterPrimitive },
}) => [
  callee,
  {
    apply: (_that, args) => {
      const target = atInternal(args, 0);
      if (isInternalPrimitive(target)) {
        throw new TypeError("Reflect.has called with non-object target");
      } else {
        const key = toPropertyKey(atExternal(args, 1));
        return enterPrimitive(has(target, key));
      }
    },
    construct: null,
  },
];
