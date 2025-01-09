import { fromPlainInternalArrayWithExternalPrototype } from "../../convert.mjs";

/** @type {import("..").OracleMapping} */
export default {
  "Array.of": {
    apply: (region, _oracles, _that, args) => {
      const {
        global: {
          undefined,
          Array: { of },
          Reflect: { apply },
        },
      } = region;
      return fromPlainInternalArrayWithExternalPrototype(
        region,
        apply(of, undefined, args),
      );
    },
    construct: null,
  },
};
