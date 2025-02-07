import {
  atExternal,
  atInternal,
  toInternalPrototype,
  toInternalReferenceSloppy,
  toPropertyKey,
} from "../convert.mjs";
import { defineInternalProperty, getInternal } from "../reflect.mjs";

/** @type {import("../oracle").ApplyOracleMapping} */
export const aran_apply_oracle_mapping = {
  "aran.getValueProperty": (region, _that, args) => {
    const receiver = atInternal(region, args, 0);
    const target = toInternalReferenceSloppy(region, receiver);
    const key = toPropertyKey(region, atExternal(region, args, 1));
    return getInternal(region, target, key, receiver);
  },
  "aran.createObject": (region, _that, args) => {
    const {
      global: {
        Object: { create },
      },
    } = region;
    const prototype = toInternalPrototype(region, atInternal(region, args, 0));
    const target = create(prototype);
    const { length } = args;
    for (let index = 1; index < length - 1; index += 2) {
      defineInternalProperty(
        region,
        target,
        toPropertyKey(region, atExternal(region, args, index)),
        {
          value: atInternal(region, args, index + 1),
          writable: true,
          enumerable: true,
          configurable: true,
        },
      );
    }
    return target;
  },
};
