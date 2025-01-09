import {
  atExternal,
  atInternal,
  toInternalReferenceStrict,
} from "../../convert.mjs";
import { toPropertyKey } from "../../domain.mjs";
import { getInternal, hasInternal, setInternal } from "../../reflect.mjs";
import { enterPrimitive } from "../../region/core.mjs";

/** @type {import("..").OracleMapping} */
export default {
  "Reflect.has": {
    apply: (region, _oracles, _that, args) => {
      const target = toInternalReferenceStrict(
        region,
        atInternal(region, args, 0),
      );
      const key = toPropertyKey(atExternal(region, args, 1));
      return enterPrimitive(region, hasInternal(region, target, key));
    },
    construct: null,
  },
  "Reflect.get": {
    apply: (region, _oracles, _that, args) => {
      const target = toInternalReferenceStrict(
        region,
        atInternal(region, args, 0),
      );
      const key = toPropertyKey(atExternal(region, args, 1));
      const receiver = args.length < 3 ? target : args[2];
      return getInternal(region, target, key, receiver);
    },
    construct: null,
  },
  "Reflect.set": {
    apply: (region, _oracles, _that, args) => {
      const target = toInternalReferenceStrict(
        region,
        atInternal(region, args, 0),
      );
      const key = toPropertyKey(atExternal(region, args, 1));
      const value = atInternal(region, args, 2);
      const receiver = args.length < 4 ? target : args[3];
      return enterPrimitive(
        region,
        setInternal(region, target, key, value, receiver),
      );
    },
    construct: null,
  },
};
