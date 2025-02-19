// Manual cloning because of non-enumerable properties -- eg: {...Reflect} = {}

/**
 * @type {(
 *   global: typeof globalThis,
 * ) => {[k in keyof import("./intrinsic").IntrinsicRecord]: any}}
 */
const cloneIntrinsicInner = ({
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
  "global.Object.create": Object.create,
  "global.Object.hasOwn": Object.hasOwn,
  // Array //
  "global.Array": Array,
  "global.Array.of": Array.of,
  "global.Array.isArray": Array.isArray,
  // Array.prototype //
  "global.Array.prototype": Array.prototype,
  "global.Array.prototype[@@iterator]": Array.prototype[Symbol.iterator],
});

/**
 * @type {(
 *   global: typeof globalThis,
 * ) => import("./intrinsic").IntrinsicRecord}
 */
export const cloneIntrinsic = cloneIntrinsicInner;
