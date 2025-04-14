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
import { wrapStandardPrimitive, wrapValue } from "../region/core.mjs";
import { map } from "../../util/array.mjs";
import { createFullArray } from "../region/create.mjs";

/**
 * @type {Record<
 *   `global.Reflect.${keyof typeof Reflect}`,
 *   import("../oracle.d.ts").Oracle
 * >}
 */
export const reflect_oracle_record = {
  "global.Reflect.apply": {
    construct: null,
    apply: (region, _that, args) => {
      const target = toInternalReferenceStrict(
        region,
        atInternal(region, args, 0),
      );
      const that = atInternal(region, args, 1);
      const input = toInternalValueArray(region, atInternal(region, args, 2));
      return applyInternal(region, target, that, input);
    },
  },
  "global.Reflect.construct": {
    construct: null,
    apply: (region, _that, args) => {
      const target = toInternalReferenceStrict(
        region,
        atInternal(region, args, 0),
      );
      const input = toInternalValueArray(region, atInternal(region, args, 1));
      const new_target =
        args.length < 3 ? target : toInternalReferenceStrict(region, args[2]);
      return constructInternal(region, target, input, new_target);
    },
  },
  "global.Reflect.defineProperty": {
    construct: null,
    apply: (region, _that, args) => {
      const target = toInternalReferenceStrict(
        region,
        atInternal(region, args, 0),
      );
      const key = toPropertyKey(region, atExternal(region, args, 1));
      const descriptor = toInternalDefineDescriptor(
        region,
        atInternal(region, args, 2),
      );
      return wrapStandardPrimitive(
        region,
        defineInternalPropertyDescriptor(region, target, key, descriptor),
      );
    },
  },
  "global.Reflect.deleteProperty": {
    construct: null,
    apply: (region, _that, args) => {
      const target = toInternalReferenceStrict(
        region,
        atInternal(region, args, 0),
      );
      const key = toPropertyKey(region, atExternal(region, args, 1));
      return wrapStandardPrimitive(
        region,
        deleteInternalOwnProperty(region, target, key),
      );
    },
  },
  "global.Reflect.get": {
    construct: null,
    apply: (region, _that, args) => {
      const target = toInternalReferenceStrict(
        region,
        atInternal(region, args, 0),
      );
      const key = toPropertyKey(region, atExternal(region, args, 1));
      const receiver = args.length < 3 ? target : args[2];
      return getInternalPropertyValue(region, target, key, receiver);
    },
  },
  "global.Reflect.getOwnPropertyDescriptor": {
    construct: null,
    apply: (region, _that, args) => {
      const target = toInternalReferenceStrict(
        region,
        atInternal(region, args, 0),
      );
      const key = toPropertyKey(region, atExternal(region, args, 1));
      const descriptor = getInternalOwnPropertyDescriptor(region, target, key);
      return descriptor
        ? fromInternalDescriptor(region, descriptor)
        : wrapStandardPrimitive(region, descriptor);
    },
  },
  "global.Reflect.getPrototypeOf": {
    construct: null,
    apply: (region, _that, args) => {
      const target = toInternalReferenceStrict(
        region,
        atInternal(region, args, 0),
      );
      const prototype = getInternalPrototype(region, target);
      return fromPrototype(region, prototype);
    },
  },
  "global.Reflect.has": {
    construct: null,
    apply: (region, _that, args) => {
      const target = toInternalReferenceStrict(
        region,
        atInternal(region, args, 0),
      );
      const key = toPropertyKey(region, atExternal(region, args, 1));
      return wrapStandardPrimitive(
        region,
        hasInternalProperty(region, target, key),
      );
    },
  },
  "global.Reflect.isExtensible": {
    construct: null,
    apply: (region, _that, args) => {
      const target = toInternalReferenceStrict(
        region,
        atInternal(region, args, 0),
      );
      return wrapStandardPrimitive(
        region,
        isInternalExtensible(region, target),
      );
    },
  },
  "global.Reflect.ownKeys": {
    construct: null,
    apply: (region, _that, args) => {
      const target = toInternalReferenceStrict(
        region,
        atInternal(region, args, 0),
      );
      return createFullArray(
        region,
        map(listInternalOwnPropertyKey(region, target), (key) =>
          wrapValue(region, key),
        ),
      );
    },
  },
  "global.Reflect.preventExtensions": {
    construct: null,
    apply: (region, _that, args) => {
      const target = toInternalReferenceStrict(
        region,
        atInternal(region, args, 0),
      );
      return wrapStandardPrimitive(
        region,
        preventInternalExtension(region, target),
      );
    },
  },
  "global.Reflect.set": {
    construct: null,
    apply: (region, _that, args) => {
      const target = toInternalReferenceStrict(
        region,
        atInternal(region, args, 0),
      );
      const key = toPropertyKey(region, atExternal(region, args, 1));
      const value = atInternal(region, args, 2);
      const receiver = args.length < 4 ? target : args[3];
      return wrapStandardPrimitive(
        region,
        setInternalPropertyValue(region, target, key, value, receiver),
      );
    },
  },
  "global.Reflect.setPrototypeOf": {
    construct: null,
    apply: (region, _that, args) => {
      const target = toInternalReferenceStrict(
        region,
        atInternal(region, args, 0),
      );
      const prototype = toPrototype(region, atInternal(region, args, 1));
      return wrapStandardPrimitive(
        region,
        setInternalPrototype(region, target, prototype),
      );
    },
  },
};
