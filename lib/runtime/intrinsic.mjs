// Manual cloning because of non-enumerable properties -- eg: {...Reflect} = {}

import { listEntry } from "../util/record.mjs";
import { Map } from "../util/collection.mjs";
import { map, swap } from "../util/array.mjs";

/**
 * @type {(
 *   global: typeof globalThis,
 * ) => {[k in keyof import("./intrinsic").GlobalIntrinsicRecord]: any}}
 */
const cloneGlobalIntrinsic = ({
  undefined,
  Function,
  Proxy,
  TypeError,
  Error,
  Reflect,
  String,
  Object,
  Array,
  Number,
}) => ({
  "global.undefined": undefined,
  "global.TypeError": TypeError,
  "global.Proxy": Proxy,
  "global.Error": Error,
  "global.String": String,
  "global.Number": Number,
  "global.Function": Function,
  "global.Reflect.apply": Reflect.apply,
  "global.Reflect.construct": Reflect.construct,
  "global.Reflect.getPrototypeOf": Reflect.getPrototypeOf,
  "global.Reflect.setPrototypeOf": Reflect.setPrototypeOf,
  "global.Reflect.isExtensible": Reflect.isExtensible,
  "global.Reflect.preventExtensions": Reflect.preventExtensions,
  "global.Reflect.defineProperty": Reflect.defineProperty,
  "global.Reflect.deleteProperty": Reflect.deleteProperty,
  "global.Reflect.getOwnPropertyDescriptor": Reflect.getOwnPropertyDescriptor,
  "global.Reflect.has": Reflect.has,
  "global.Reflect.get": Reflect.get,
  "global.Reflect.set": Reflect.set,
  "global.Reflect.ownKeys": Reflect.ownKeys,
  "global.Object": Object,
  "global.Object.prototype": Object.prototype,
  "global.Object.defineProperty": Object.defineProperty,
  "global.Object.getOwnPropertyDescriptor": Object.getOwnPropertyDescriptor,
  "global.Object.create": Object.create,
  "global.Object.hasOwn": Object.hasOwn,
  "global.Object.setPrototypeOf": Object.setPrototypeOf,
  "global.Object.getPrototypeOf": Object.getPrototypeOf,
  "global.Array": Array,
  "global.Array.prototype": Array.prototype,
  "global.Array.of": Array.of,
  "global.Function.prototype": Function.prototype,
});

/**
 * @type {(
 *   intrinsics: import("aran").ExtraIntrinsicRecord,
 * ) => {[k in keyof import("./intrinsic").AranIntrinsicRecord]: any}}
 */
const cloneAranIntrinsic = ({
  "aran.sliceObject": sliceObject,
  "aran.listForInKey": ListForInKey,
  "aran.getValueProperty": getValueProperty,
  "aran.createObject": createObject,
}) => ({
  "aran.sliceObject": sliceObject,
  "aran.listForInKey": ListForInKey,
  "aran.getValueProperty": getValueProperty,
  "aran.createObject": createObject,
});

const listIntrinsicRecordEntry = /**
 * @type {(
 *   record: import("./intrinsic").IntrinsicRecord,
 * ) => [
 *   keyof import("./intrinsic").IntrinsicRecord,
 *   import("./domain").PlainExternalReference,
 * ][]}
 */ (listEntry);

/**
 * @type {(
 *   record: import("./intrinsic").IntrinsicRecord,
 * ) => import("./intrinsic").Naming}
 */
const recordName = (record) =>
  new Map(map(listIntrinsicRecordEntry(record), swap));

/**
 * @type {(
 *   intrinsics: import("aran").ExtraIntrinsicRecord,
 * ) => {
 *   record: import("./intrinsic").IntrinsicRecord,
 *   naming: import("./intrinsic").Naming,
 * }}
 */
export const setupIntrinsic = (intrinsics) => {
  /**
   * @type {import("./intrinsic").IntrinsicRecord}
   */
  const record = {
    ...cloneGlobalIntrinsic(intrinsics["aran.global_object"]),
    ...cloneAranIntrinsic(intrinsics),
  };
  return { record, naming: recordName(record) };
};
