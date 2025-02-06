import {
  atExternal,
  atInternal,
  fromInternalDescriptor,
  fromInternalPrototype,
  fromPrimitiveArray,
  toInternalDefineDescriptor,
  toInternalPrototype,
  toInternalReferenceStrict,
  toInternalValueArray,
} from "../convert.mjs";
import { toPropertyKey } from "../domain.mjs";
import {
  applyInternal,
  constructInternal,
  defineInternalProperty,
  deleteInternalProperty,
  getInternal,
  getInternalProperty,
  getInternalPrototype,
  hasInternal,
  isInternalExtensible,
  listInternalProperty,
  preventInternalExtension,
  setInternal,
  setInternalPrototype,
} from "../reflect.mjs";
import { enterPrimitive } from "../region/core.mjs";

/** @type {import("../oracle").ApplyOracleMapping} */
export const reflect_apply_oracle_mapping = {
  "Reflect.apply": (region, _that, args) => {
    const target = toInternalReferenceStrict(
      region,
      atInternal(region, args, 0),
    );
    const that = atInternal(region, args, 1);
    const input = toInternalValueArray(region, atInternal(region, args, 2));
    return applyInternal(region, target, that, input);
  },
  "Reflect.construct": (region, _that, args) => {
    const target = toInternalReferenceStrict(
      region,
      atInternal(region, args, 0),
    );
    const input = toInternalValueArray(region, atInternal(region, args, 1));
    const new_target =
      args.length < 3 ? target : toInternalReferenceStrict(region, args[2]);
    return constructInternal(region, target, input, new_target);
  },
  "Reflect.getPrototypeOf": (region, _that, args) => {
    const target = toInternalReferenceStrict(
      region,
      atInternal(region, args, 0),
    );
    const prototype1 = getInternalPrototype(region, target);
    const prototype2 = fromInternalPrototype(region, prototype1);
    return prototype2;
  },
  "Reflect.setPrototypeOf": (region, _that, args) => {
    const target = toInternalReferenceStrict(
      region,
      atInternal(region, args, 0),
    );
    const prototype = toInternalPrototype(region, atInternal(region, args, 1));
    return enterPrimitive(
      region,
      setInternalPrototype(region, target, prototype),
    );
  },
  "Reflect.isExtensible": (region, _that, args) => {
    const target = toInternalReferenceStrict(
      region,
      atInternal(region, args, 0),
    );
    return enterPrimitive(region, isInternalExtensible(region, target));
  },
  "Reflect.preventExtensions": (region, _that, args) => {
    const target = toInternalReferenceStrict(
      region,
      atInternal(region, args, 0),
    );
    return enterPrimitive(region, preventInternalExtension(region, target));
  },
  "Reflect.deleteProperty": (region, _that, args) => {
    const target = toInternalReferenceStrict(
      region,
      atInternal(region, args, 0),
    );
    const key = toPropertyKey(atExternal(region, args, 1));
    return enterPrimitive(region, deleteInternalProperty(region, target, key));
  },
  "Reflect.defineProperty": (region, _that, args) => {
    const target = toInternalReferenceStrict(
      region,
      atInternal(region, args, 0),
    );
    const key = toPropertyKey(atExternal(region, args, 1));
    const descriptor = toInternalDefineDescriptor(
      region,
      atInternal(region, args, 2),
    );
    return enterPrimitive(
      region,
      defineInternalProperty(region, target, key, descriptor),
    );
  },
  "Reflect.getOwnPropertyDescriptor": (region, _that, args) => {
    const target = toInternalReferenceStrict(
      region,
      atInternal(region, args, 0),
    );
    const key = toPropertyKey(atExternal(region, args, 1));
    const descriptor = getInternalProperty(region, target, key);
    return descriptor
      ? fromInternalDescriptor(region, descriptor)
      : enterPrimitive(region, descriptor);
  },
  "Reflect.ownKeys": (region, _that, args) => {
    const target = toInternalReferenceStrict(
      region,
      atInternal(region, args, 0),
    );
    return fromPrimitiveArray(region, listInternalProperty(region, target));
  },
  "Reflect.has": (region, _that, args) => {
    const target = toInternalReferenceStrict(
      region,
      atInternal(region, args, 0),
    );
    const key = toPropertyKey(atExternal(region, args, 1));
    return enterPrimitive(region, hasInternal(region, target, key));
  },
  "Reflect.get": (region, _that, args) => {
    const target = toInternalReferenceStrict(
      region,
      atInternal(region, args, 0),
    );
    const key = toPropertyKey(atExternal(region, args, 1));
    const receiver = args.length < 3 ? target : args[2];
    return getInternal(region, target, key, receiver);
  },
  "Reflect.set": (region, _that, args) => {
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
};
