import { toPropertyKey } from "../../domain.mjs";

/** @type {import("../oracle").CompileOracleEntry} */
export default ({
  global: {
    Object: { hasOwn },
    Reflect: { has, getPrototypeOf },
  },
  region: {
    isInternalPrimitive,
    leavePrimitive,
    atInternal,
    atExternal,
    isGuestInternalReference,
    enterPrototype,
    leavePlainExternalReference,
    enterPrimitive,
  },
}) => [
  has,
  {
    apply: (_that, args) => {
      const target = atInternal(args, 0);
      const key = toPropertyKey(atExternal(args, 1));
      if (isInternalPrimitive(target)) {
        return has(leavePrimitive(target), key);
      } else {
        /** @type {import("../../domain").InternalPrototype} */
        let internal = target;
        while (internal !== null) {
          if (isGuestInternalReference(internal)) {
            const external = leavePlainExternalReference(internal);
            if (hasOwn(external, key)) {
              return enterPrimitive(true);
            } else {
              internal = enterPrototype(getPrototypeOf(external));
              continue;
            }
          } else {
            if (hasOwn(internal, key)) {
              return enterPrimitive(true);
            } else {
              continue;
            }
          }
        }
        return enterPrimitive(false);
      }
    },
    construct: null,
  },
];
