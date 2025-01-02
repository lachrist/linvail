/** @type {import("../oracle").CompileOracleEntry} */
export default ({
  apply,
  global: {
    Reflect: { get },
  },
  region: { atInternal, toInternalReference, enterPlainExternalReference },
}) => [
  get,
  {
    apply: (that, args) => {
      const receiver = atInternal(args, 0);
      const key = atInternal(args, 1);
      return apply(
        enterPlainExternalReference(/** @type {any} */ (get)),
        that,
        [toInternalReference(receiver), key, receiver],
      );
    },
    construct: null,
  },
];
