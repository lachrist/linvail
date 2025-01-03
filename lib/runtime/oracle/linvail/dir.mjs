/** @type {import("..").CompileOracleEntry} */
export default ({
  linvail: { dir },
  convert: { atInternal },
  region: { enterPrimitive },
}) => [
  dir,
  {
    apply: (_that, args) => enterPrimitive(dir(atInternal(args, 0))),
    construct: null,
  },
];
