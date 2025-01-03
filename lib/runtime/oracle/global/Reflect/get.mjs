import { toPropertyKey } from "../../../domain.mjs";

/** @type {import("../..").CompileOracleEntry} */
export default ({
  reflect: { get },
  global: {
    TypeError,
    Reflect: { get: callee },
  },
  convert: { atInternal, atExternal },
  region: { isInternalPrimitive },
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
