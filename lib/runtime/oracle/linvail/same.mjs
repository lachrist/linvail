/** @type {import("../oracle").CompileOracleEntry} */
export default ({
  linvail: { same },
  region: { enterPrimitive, atInternal },
}) => [
  same,
  {
    apply: (_that, args) =>
      enterPrimitive(same(atInternal(args, 0), atInternal(args, 1))),
    construct: null,
  },
];
