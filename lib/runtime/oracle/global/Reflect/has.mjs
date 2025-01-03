import { toPropertyKey } from "../../../domain.mjs";

/** @type {import("../..").CompileOracleEntry} */
export default ({
  reflect: { has },
  global: {
    TypeError,
    Reflect: { has: callee },
  },
  convert: { atInternal, atExternal },
  region: { isInternalPrimitive, enterPrimitive },
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
