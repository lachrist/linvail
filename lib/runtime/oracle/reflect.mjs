// Some oracles such as the one for `Reflect.preventExtensions`
// do not add more precision over applying the builtin over
// GuestExternalReference but they are probablty faster.

import {
  atExternal,
  atInternal,
  fromInternalDescriptor,
  fromPrototype,
  toInternalDefineDescriptor,
  toPrototype,
  toInternalReferenceStrict,
  toInternalValueArray,
  toPropertyKey,
} from "./helper.mjs";
import {
  applyInternal,
  constructInternal,
  defineInternalPropertyDescriptor,
  deleteInternalOwnProperty,
  getInternalPropertyValue,
  getInternalOwnPropertyDescriptor,
  getInternalPrototype,
  hasInternalProperty,
  isInternalExtensible,
  listInternalOwnPropertyKey,
  preventInternalExtension,
  setInternalPropertyValue,
  setInternalPrototype,
} from "../reflect.mjs";
import {
  createFullArray,
  enterStandardPrimitive,
  enterValue,
} from "../region/core.mjs";
import { map } from "../../util/array.mjs";

/**
 * @type {import("../oracle.d.ts").ApplyOracleMapping<
 *   `global.Reflect.${keyof typeof Reflect}`
 * >}
 */
export const reflect_apply_oracle_mapping = {
  "global.Reflect.apply": (region, _that, args) => {
    const target = toInternalReferenceStrict(
      region,
      atInternal(region, args, 0),
    );
    const that = atInternal(region, args, 1);
    const input = toInternalValueArray(region, atInternal(region, args, 2));
    return applyInternal(region, target, that, input);
  },
  "global.Reflect.construct": (region, _that, args) => {
    const target = toInternalReferenceStrict(
      region,
      atInternal(region, args, 0),
    );
    const input = toInternalValueArray(region, atInternal(region, args, 1));
    const new_target =
      args.length < 3 ? target : toInternalReferenceStrict(region, args[2]);
    return constructInternal(region, target, input, new_target);
  },
  "global.Reflect.defineProperty": (region, _that, args) => {
    const target = toInternalReferenceStrict(
      region,
      atInternal(region, args, 0),
    );
    const key = toPropertyKey(region, atExternal(region, args, 1));
    const descriptor = toInternalDefineDescriptor(
      region,
      atInternal(region, args, 2),
    );
    return enterStandardPrimitive(
      region,
      defineInternalPropertyDescriptor(region, target, key, descriptor),
    );
  },
  "global.Reflect.deleteProperty": (region, _that, args) => {
    const target = toInternalReferenceStrict(
      region,
      atInternal(region, args, 0),
    );
    const key = toPropertyKey(region, atExternal(region, args, 1));
    return enterStandardPrimitive(
      region,
      deleteInternalOwnProperty(region, target, key),
    );
  },
  "global.Reflect.get": (region, _that, args) => {
    const target = toInternalReferenceStrict(
      region,
      atInternal(region, args, 0),
    );
    const key = toPropertyKey(region, atExternal(region, args, 1));
    const receiver = args.length < 3 ? target : args[2];
    return getInternalPropertyValue(region, target, key, receiver);
  },
  "global.Reflect.getOwnPropertyDescriptor": (region, _that, args) => {
    const target = toInternalReferenceStrict(
      region,
      atInternal(region, args, 0),
    );
    const key = toPropertyKey(region, atExternal(region, args, 1));
    const descriptor = getInternalOwnPropertyDescriptor(region, target, key);
    return descriptor
      ? fromInternalDescriptor(region, descriptor)
      : enterStandardPrimitive(region, descriptor);
  },
  "global.Reflect.getPrototypeOf": (region, _that, args) => {
    const target = toInternalReferenceStrict(
      region,
      atInternal(region, args, 0),
    );
    const prototype = getInternalPrototype(region, target);
    return fromPrototype(region, prototype);
  },
  "global.Reflect.has": (region, _that, args) => {
    const target = toInternalReferenceStrict(
      region,
      atInternal(region, args, 0),
    );
    const key = toPropertyKey(region, atExternal(region, args, 1));
    return enterStandardPrimitive(
      region,
      hasInternalProperty(region, target, key),
    );
  },
  "global.Reflect.isExtensible": (region, _that, args) => {
    const target = toInternalReferenceStrict(
      region,
      atInternal(region, args, 0),
    );
    return enterStandardPrimitive(region, isInternalExtensible(region, target));
  },
  "global.Reflect.ownKeys": (region, _that, args) => {
    const target = toInternalReferenceStrict(
      region,
      atInternal(region, args, 0),
    );
    return createFullArray(
      region,
      map(listInternalOwnPropertyKey(region, target), (key) =>
        enterValue(region, key),
      ),
    );
  },
  "global.Reflect.preventExtensions": (region, _that, args) => {
    const target = toInternalReferenceStrict(
      region,
      atInternal(region, args, 0),
    );
    return enterStandardPrimitive(
      region,
      preventInternalExtension(region, target),
    );
  },
  "global.Reflect.set": (region, _that, args) => {
    const target = toInternalReferenceStrict(
      region,
      atInternal(region, args, 0),
    );
    const key = toPropertyKey(region, atExternal(region, args, 1));
    const value = atInternal(region, args, 2);
    const receiver = args.length < 4 ? target : args[3];
    return enterStandardPrimitive(
      region,
      setInternalPropertyValue(region, target, key, value, receiver),
    );
  },
  "global.Reflect.setPrototypeOf": (region, _that, args) => {
    const target = toInternalReferenceStrict(
      region,
      atInternal(region, args, 0),
    );
    const prototype = toPrototype(region, atInternal(region, args, 1));
    return enterStandardPrimitive(
      region,
      setInternalPrototype(region, target, prototype),
    );
  },
};
