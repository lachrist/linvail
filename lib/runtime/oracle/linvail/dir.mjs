/** @type {import("../oracle").CompileOracleEntry} */
export default ({
  linvail: { dir },
  region: { enterPrimitive, atInternal },
}) => [
  dir,
  {
    apply: (_that, args) => enterPrimitive(dir(atInternal(args, 0))),
    construct: null,
  },
];
