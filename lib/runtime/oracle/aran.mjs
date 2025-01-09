import {
  atExternal,
  atInternal,
  toInternalReferenceSloppy,
} from "../convert.mjs";
import { toPropertyKey } from "../domain.mjs";
import { getInternal } from "../reflect.mjs";

/** @type {import("../oracle").ApplyOracleMapping} */
export const aran_apply_oracle_mapping = {
  "aran.get": (region, _that, args) => {
    const receiver = atInternal(region, args, 0);
    const target = toInternalReferenceSloppy(region, receiver);
    const key = toPropertyKey(atExternal(region, args, 1));
    return getInternal(region, target, key, receiver);
  },
};
