/** @type {import("..").CompileOracleEntry} */
export default ({
  linvail: { same },
  convert: { atInternal },
  region: { enterPrimitive },
}) => [
  same,
  {
    apply: (_that, args) =>
      enterPrimitive(same(atInternal(args, 0), atInternal(args, 1))),
    construct: null,
  },
];
