import {
  atExternal,
  atInternal,
  toInternalReferenceSloppy,
} from "../convert.mjs";
import { toPropertyKey } from "../domain.mjs";
import { getInternal } from "../reflect.mjs";

/** @type {import(".").OracleMapping} */
export default {
  "aran.get": {
    apply: (region, _oracles, _that, args) => {
      const receiver = atInternal(region, args, 0);
      const target = toInternalReferenceSloppy(region, receiver);
      const key = toPropertyKey(atExternal(region, args, 1));
      return getInternal(region, target, key, receiver);
    },
    construct: null,
  },
};
