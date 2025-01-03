/** @type {import("../..").CompileOracleEntry} */
export default ({
  global: {
    undefined,
    Reflect: { apply },
    Array: { of },
    Object: { getPrototypeOf, setPrototypeOf },
  },
  region: { enterPrototype },
}) => [
  of,
  {
    apply: (_that, args) => {
      const array = apply(of, undefined, args);
      return setPrototypeOf(array, enterPrototype(getPrototypeOf(array)));
    },
    construct: null,
  },
];
