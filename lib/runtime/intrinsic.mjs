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
  isNaN,
  undefined,
  Function,
  Proxy,
  TypeError,
  RangeError,
  Error,
  Reflect,
  Reflect: { getOwnPropertyDescriptor },
  Symbol,
  String,
  Object,
  Array,
  Number,
}) => ({
  // Other //
  "global.isNaN": isNaN,
  "global.undefined": undefined,
  "global.TypeError": TypeError,
  "global.RangeError": RangeError,
  "global.Proxy": Proxy,
  "global.Error": Error,
  "global.String": String,
  "global.Number": Number,
  "global.Number.MAX_SAFE_INTEGER": Number.MAX_SAFE_INTEGER,
  "global.Number.MIN_SAFE_INTEGER": Number.MIN_SAFE_INTEGER,
  // Function //
  "global.Function": Function,
  "global.Function.prototype": Function.prototype,
  "global.Function.prototype.arguments@get": /** @type {{get: any}} */ (
    getOwnPropertyDescriptor(Function.prototype, "arguments")
  ).get,
  "global.Function.prototype.arguments@set": /** @type {{set: any}} */ (
    getOwnPropertyDescriptor(Function.prototype, "arguments")
  ).set,
  // Symbol //
  "global.Symbol.iterator": Symbol.iterator,
  "global.Symbol.species": Symbol.species,
  "global.Symbol.isConcatSpreadable": Symbol.isConcatSpreadable,
  "global.Symbol.toStringTag": Symbol.toStringTag,
  // Reflect //
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
  // Object //
  "global.Object": Object,
  "global.Object.is": Object.is,
  "global.Object.prototype": Object.prototype,
  "global.Object.defineProperty": Object.defineProperty,
  "global.Object.getOwnPropertyDescriptor": Object.getOwnPropertyDescriptor,
  "global.Object.create": Object.create,
  "global.Object.hasOwn": Object.hasOwn,
  "global.Object.setPrototypeOf": Object.setPrototypeOf,
  "global.Object.getPrototypeOf": Object.getPrototypeOf,
  "global.Object.keys": Object.keys,
  "global.Object.values": Object.values,
  "global.Object.entries": Object.entries,
  "global.Object.getOwnPropertyNames": Object.getOwnPropertyNames,
  "global.Object.getOwnPropertySymbols": Object.getOwnPropertySymbols,
  "global.Object.assign": Object.assign,
  "global.Object.freeze": Object.freeze,
  "global.Object.seal": Object.seal,
  "global.Object.preventExtensions": Object.preventExtensions,
  "global.Object.isFrozen": Object.isFrozen,
  "global.Object.isSealed": Object.isSealed,
  "global.Object.isExtensible": Object.isExtensible,
  "global.Object.groupBy": Object.groupBy,
  "global.Object.fromEntries": Object.fromEntries,
  "global.Object.defineProperties": Object.defineProperties,
  "global.Object.getOwnPropertyDescriptors": Object.getOwnPropertyDescriptors,
  // Array //
  "global.Array": Array,
  "global.Array.of": Array.of,
  "global.Array.from": Array.from,
  "global.Array.isArray": Array.isArray,
  // Array.prototype //
  "global.Array.prototype": Array.prototype,
  "global.Array.prototype.at": Array.prototype.at,
  "global.Array.prototype.concat": Array.prototype.concat,
  "global.Array.prototype.copyWithin": Array.prototype.copyWithin,
  "global.Array.prototype.fill": Array.prototype.fill,
  "global.Array.prototype.find": Array.prototype.find,
  "global.Array.prototype.findIndex": Array.prototype.findIndex,
  "global.Array.prototype.findLast": Array.prototype.findLast,
  "global.Array.prototype.findLastIndex": Array.prototype.findLastIndex,
  "global.Array.prototype.lastIndexOf": Array.prototype.lastIndexOf,
  "global.Array.prototype.pop": Array.prototype.pop,
  "global.Array.prototype.push": Array.prototype.push,
  "global.Array.prototype.reverse": Array.prototype.reverse,
  "global.Array.prototype.shift": Array.prototype.shift,
  "global.Array.prototype.unshift": Array.prototype.unshift,
  "global.Array.prototype.slice": Array.prototype.slice,
  "global.Array.prototype.sort": Array.prototype.sort,
  "global.Array.prototype.splice": Array.prototype.splice,
  "global.Array.prototype.includes": Array.prototype.includes,
  "global.Array.prototype.indexOf": Array.prototype.indexOf,
  "global.Array.prototype.join": Array.prototype.join,
  "global.Array.prototype.keys": Array.prototype.keys,
  "global.Array.prototype.entries": Array.prototype.entries,
  "global.Array.prototype.values": Array.prototype.values,
  "global.Array.prototype.forEach": Array.prototype.forEach,
  "global.Array.prototype.filter": Array.prototype.filter,
  "global.Array.prototype.flat": Array.prototype.flat,
  "global.Array.prototype.flatMap": Array.prototype.flatMap,
  "global.Array.prototype.map": Array.prototype.map,
  "global.Array.prototype.every": Array.prototype.every,
  "global.Array.prototype.some": Array.prototype.some,
  "global.Array.prototype.reduce": Array.prototype.reduce,
  "global.Array.prototype.reduceRight": Array.prototype.reduceRight,
  "global.Array.prototype.toReversed": Array.prototype.toReversed,
  "global.Array.prototype.toSorted": Array.prototype.toSorted,
  "global.Array.prototype.toSpliced": Array.prototype.toSpliced,
  "global.Array.prototype.with": Array.prototype.with,
  "global.Array.prototype.toLocaleString": Array.prototype.toLocaleString,
  "global.Array.prototype.toString": Array.prototype.toString,
  "global.Array.prototype[@@iterator]": Array.prototype[Symbol.iterator],
});

/**
 * @type {(
 *   intrinsics: import("aran").ExtraIntrinsicRecord,
 * ) => {[k in keyof import("./intrinsic").AranIntrinsicRecord]: any}}
 */
const cloneAranIntrinsic = ({
  "aran.GeneratorFunction.prototype.prototype": generator_prototype_prototype,
  "aran.AsyncGeneratorFunction.prototype.prototype":
    async_generator_prototype_prototype,
  "aran.sliceObject": sliceObject,
  "aran.listForInKey": ListForInKey,
  "aran.getValueProperty": getValueProperty,
  "aran.createObject": createObject,
  "aran.toArgumentList": toArgumentList,
  "aran.listIteratorRest": ListIteratorRest,
}) => ({
  "aran.GeneratorFunction.prototype.prototype": generator_prototype_prototype,
  "aran.AsyncGeneratorFunction.prototype.prototype":
    async_generator_prototype_prototype,
  "aran.sliceObject": sliceObject,
  "aran.listForInKey": ListForInKey,
  "aran.getValueProperty": getValueProperty,
  "aran.createObject": createObject,
  "aran.toArgumentList": toArgumentList,
  "aran.listIteratorRest": ListIteratorRest,
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
