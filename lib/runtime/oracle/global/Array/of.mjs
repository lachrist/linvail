/** @type {import("../../oracle").CompileOracleEntry} */
export default ({
  global: {
    undefined,
    Reflect: { apply },
    Array: { of },
  },
  region: { harmonizePrototype },
}) => [
  of,
  {
    apply: (_that, args) => harmonizePrototype(apply(of, undefined, args)),
    construct: null,
  },
];
