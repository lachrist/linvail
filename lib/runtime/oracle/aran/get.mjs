import { toPropertyKey } from "../../domain.mjs";

/** @type {import("..").CompileOracleEntry} */
export default ({
  aran: { get: callee },
  reflect: { get },
  convert: { atInternal, atExternal, toTarget },
}) => [
  callee,
  {
    apply: (_that, args) => {
      const receiver = atInternal(args, 0);
      const target = toTarget(receiver);
      const key = toPropertyKey(atExternal(args, 1));
      console.dir({ args, receiver, target, key });
      return get(target, key, receiver);
    },
    construct: null,
  },
];
