/** @type {import("../..").CompileOracleEntry} */
export default ({
  global: {
    undefined,
    Reflect: { apply },
    Array: { of },
  },
  convert: { internalizeArrayPrototype },
}) => [
  of,
  {
    apply: (_that, args) =>
      internalizeArrayPrototype(apply(of, undefined, args)),
    construct: null,
  },
];
