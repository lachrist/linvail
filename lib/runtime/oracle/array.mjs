import { fromPlainInternalArrayWithExternalPrototype } from "../convert.mjs";

/** @type {import("../oracle").ApplyOracleMapping} */
export const array_apply_oracle_mapping = {
  "Array.of": (region, _that, args) => {
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
};
