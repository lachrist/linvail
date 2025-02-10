import { fromPlainInternalArrayWithExternalPrototype } from "../convert.mjs";

/** @type {import("../oracle").ApplyOracleMapping} */
export const array_apply_oracle_mapping = {
  "global.Array.of": (region, _that, args) => {
    const {
      "global.undefined": undefined,
      "global.Array.of": toArray,
      "global.Reflect.apply": apply,
    } = region;
    return fromPlainInternalArrayWithExternalPrototype(
      region,
      apply(toArray, undefined, args),
    );
  },
};
