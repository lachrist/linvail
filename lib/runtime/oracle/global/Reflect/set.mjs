import { toPropertyKey } from "../../../domain.mjs";

/** @type {import("../..").CompileOracleEntry} */
export default ({
  reflect: { set },
  global: {
    TypeError,
    Reflect: { set: callee },
  },
  convert: { atInternal, atExternal },
  region: { enterPrimitive, isInternalPrimitive },
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
