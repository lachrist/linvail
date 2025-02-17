import type {
  DataDescriptor,
  DefineDescriptor,
  Descriptor,
  ExternalPrototype,
  ExternalReference,
  ExternalValue,
  GuestExternalReference,
  InternalPrototype,
  InternalReference,
  InternalValue,
  NonLengthPropertyKey,
  PlainExternalReference,
  PlainInternalArray,
  PlainInternalArrayWithExternalPrototype,
  PlainInternalClosure,
  PlainInternalObject,
  PlainInternalObjectWithExternalPrototype,
  PlainInternalReference,
  RawPlainInternalClosure,
} from "./domain";
import type { Primitive } from "../util/primitive";
import type { Map } from "../util/collection";

export type AranIntrinsicRecord = {
  "aran.GeneratorFunction.prototype.prototype": PlainExternalReference;
  "aran.AsyncGeneratorFunction.prototype.prototype": PlainExternalReference;
  "aran.toArgumentList": PlainExternalReference;
  "aran.sliceObject": unknown;
  "aran.listForInKey": unknown;
  "aran.getValueProperty": unknown;
  "aran.createObject": unknown;
  "aran.listIteratorRest": unknown;
};

export type GlobalIntrinsicRecord = {
  // Other //
  "global.isNaN": (value: ExternalValue) => boolean;
  "global.Proxy": new (target: any, handler: any) => GuestExternalReference;
  "global.String": {
    (value: ExternalValue): string;
    new (value: ExternalValue): PlainExternalReference;
  };
  "global.Error": new (message: string) => Error;
  "global.TypeError": new (message: string) => Error;
  "global.undefined": undefined;
  // Function //
  "global.Function": new (...source: string[]) => Function;
  "global.Function.prototype": PlainExternalReference;
  "global.Function.prototype.arguments@get": PlainExternalReference;
  "global.Function.prototype.arguments@set": PlainExternalReference;
  // Number //
  "global.Number": {
    (value: ExternalValue): number;
    new (value: ExternalValue): PlainExternalReference;
  };
  "global.Number.MAX_SAFE_INTEGER": number;
  "global.Number.MIN_SAFE_INTEGER": number;
  // Symbol //
  "global.Symbol.iterator": symbol;
  "global.Symbol.species": symbol;
  "global.Symbol.isConcatSpreadable": symbol;
  "global.Symbol.toStringTag": symbol;
  // Reflect //
  "global.Reflect.apply": {
    (target: Primitive, that: unknown, args: unknown): never;
    (
      target: PlainInternalReference,
      that: InternalValue,
      args: InternalValue[],
    ): InternalValue | PlainExternalReference;
    (
      target: PlainExternalReference,
      that: ExternalValue,
      args: ExternalValue[],
    ): ExternalValue;
    <T, Y>(target: () => Y, that: T, args: []): Y;
    <T, X, Y>(target: (...args: X[]) => Y, that: T, args: X[]): Y;
  };
  "global.Reflect.construct": {
    (target: Primitive, args: unknown, new_target: unknown): never;
    (
      target: PlainExternalReference,
      args: ExternalValue[],
      new_target: ExternalValue,
    ): ExternalReference;
    (
      target: PlainInternalReference,
      args: InternalValue[],
      new_target: InternalValue,
    ): InternalReference;
  };
  "global.Reflect.preventExtensions": {
    (target: Primitive): never;
    (target: PlainExternalReference): boolean;
    (target: PlainInternalReference): boolean;
  };
  "global.Reflect.isExtensible": {
    (target: Primitive): never;
    (target: PlainExternalReference): boolean;
    (target: PlainInternalReference): boolean;
  };
  "global.Reflect.getPrototypeOf": {
    (target: Primitive): never;
    (target: PlainExternalReference): ExternalPrototype;
    (target: PlainInternalReference): InternalPrototype;
    (target: PlainInternalArrayWithExternalPrototype): ExternalPrototype;
    (target: PlainInternalObjectWithExternalPrototype): ExternalPrototype;
    (target: RawPlainInternalClosure): ExternalPrototype;
  };
  "global.Reflect.setPrototypeOf": {
    (target: Primitive, prototype: unknown): never;
    (target: PlainExternalReference, prototype: ExternalPrototype): boolean;
    (target: PlainInternalReference, prototype: InternalPrototype): boolean;
    (
      target: PlainInternalArrayWithExternalPrototype,
      prototype: InternalPrototype,
    ): boolean;
    (
      target: PlainInternalObjectWithExternalPrototype,
      prototype: InternalPrototype,
    ): boolean;
  };
  "global.Reflect.ownKeys": {
    (target: Primitive): never;
    (target: PlainExternalReference): (string | symbol)[];
    (target: PlainInternalReference): (string | symbol)[];
  };
  "global.Reflect.deleteProperty": {
    (target: Primitive, key: unknown): never;
    (target: PlainExternalReference, key: ExternalValue): boolean;
    (target: PlainInternalReference, key: ExternalValue): boolean;
  };
  "global.Reflect.getOwnPropertyDescriptor": {
    (target: Primitive, key: unknown): never;
    (
      target: PlainExternalReference,
      key: ExternalValue,
    ): Descriptor<ExternalValue, ExternalReference> | undefined;
    (
      target: PlainInternalClosure | PlainInternalObject,
      key: ExternalValue,
    ): Descriptor<InternalValue, InternalReference> | undefined;
    (
      target: PlainInternalArray,
      key: NonLengthPropertyKey,
    ): Descriptor<InternalValue, InternalReference> | undefined;
    (target: PlainInternalArray, key: "length"): DataDescriptor<number>;
  };
  "global.Reflect.defineProperty": {
    (target: Primitive, key: unknown, descriptor: unknown): never;
    (
      target: PlainExternalReference,
      key: ExternalValue,
      descriptor: DefineDescriptor<ExternalValue, ExternalValue>,
    ): boolean;
    (
      target: PlainInternalClosure | PlainInternalObject,
      key: ExternalValue,
      descriptor: DefineDescriptor<InternalValue, InternalValue>,
    ): boolean;
    (
      target: PlainInternalArray,
      key: NonLengthPropertyKey,
      descriptor: DefineDescriptor<InternalValue, InternalValue>,
    ): boolean;
    (
      target: PlainInternalArray,
      key: number | symbol,
      descriptor: DefineDescriptor<InternalValue, InternalValue>,
    ): boolean;
    (
      target: PlainInternalArray,
      key: "length",
      descriptor: DefineDescriptor<ExternalValue, ExternalValue>,
    ): boolean;
  };
  "global.Reflect.has": {
    (target: Primitive, key: unknown): never;
    (target: PlainExternalReference, key: ExternalValue): boolean;
  };
  "global.Reflect.get": {
    (target: Primitive, key: unknown, receiver: unknown): never;
    (
      target: PlainExternalReference,
      key: ExternalValue,
      receiver: ExternalValue,
    ): ExternalValue;
    (target: PlainInternalArray, key: "length"): number;
  };
  "global.Reflect.set": {
    (target: Primitive, key: unknown, value: unknown, receiver: unknown): never;
    (
      target: PlainExternalReference,
      key: ExternalValue,
      value: ExternalValue,
      receiver: ExternalValue,
    ): boolean;
  };
  // Object //
  "global.Object": {
    (): PlainInternalReference & {
      __type: "Object";
      __prototype: "External";
    };
    (value: Primitive): PlainExternalReference;
  };
  "global.Object.assign": unknown;
  "global.Object.create": {
    (
      prototype: InternalPrototype,
      descriptors: {
        [key in PropertyKey]: DefineDescriptor<
          InternalValue,
          InternalReference
        >;
      },
    ): PlainInternalObject;
    (prototype: InternalPrototype): PlainInternalObject;
  };
  "global.Object.defineProperties": unknown;
  "global.Object.defineProperty": unknown;
  "global.Object.entries": unknown;
  "global.Object.freeze": unknown;
  "global.Object.fromEntries": unknown;
  "global.Object.getOwnPropertyDescriptor": unknown;
  "global.Object.getOwnPropertyDescriptors": unknown;
  "global.Object.getOwnPropertyNames": unknown;
  "global.Object.getOwnPropertySymbols": unknown;
  "global.Object.getPrototypeOf": unknown;
  "global.Object.groupBy": unknown;
  "global.Object.hasOwn": {
    (target: PlainExternalReference, key: ExternalValue): boolean;
    (target: PlainInternalReference, key: ExternalValue): boolean;
  };
  "global.Object.is": (value1: ExternalValue, value2: ExternalValue) => boolean;
  "global.Object.isExtensible": unknown;
  "global.Object.isFrozen": unknown;
  "global.Object.isSealed": unknown;
  "global.Object.keys": unknown;
  "global.Object.preventExtensions": unknown;
  "global.Object.seal": unknown;
  "global.Object.setPrototypeOf": unknown;
  "global.Object.values": unknown;
  // Object.prototype //
  "global.Object.prototype": PlainExternalReference;
  // Array //
  "global.Array": {
    new (length: number): PlainInternalArrayWithExternalPrototype;
    new (...elements: InternalValue[]): PlainInternalArrayWithExternalPrototype;
  };
  "global.Array.of": (
    ...elements: InternalValue[]
  ) => PlainInternalArrayWithExternalPrototype;
  "global.Array.from": unknown;
  "global.Array.isArray": {
    (value: PlainInternalReference): boolean;
    (value: PlainExternalReference): boolean;
  };
  // Array.prototype //
  "global.Array.prototype": PlainExternalReference;
  "global.Array.prototype.at": unknown;
  "global.Array.prototype.concat": unknown;
  "global.Array.prototype.copyWithin": unknown;
  "global.Array.prototype.fill": unknown;
  "global.Array.prototype.find": unknown;
  "global.Array.prototype.findIndex": unknown;
  "global.Array.prototype.findLast": unknown;
  "global.Array.prototype.findLastIndex": unknown;
  "global.Array.prototype.lastIndexOf": unknown;
  "global.Array.prototype.pop": unknown;
  "global.Array.prototype.push": unknown;
  "global.Array.prototype.reverse": unknown;
  "global.Array.prototype.shift": unknown;
  "global.Array.prototype.unshift": unknown;
  "global.Array.prototype.slice": unknown;
  "global.Array.prototype.sort": unknown;
  "global.Array.prototype.splice": unknown;
  "global.Array.prototype.includes": unknown;
  "global.Array.prototype.indexOf": unknown;
  "global.Array.prototype.join": unknown;
  "global.Array.prototype.keys": unknown;
  "global.Array.prototype.entries": unknown;
  "global.Array.prototype.values": unknown;
  "global.Array.prototype.forEach": unknown;
  "global.Array.prototype.filter": unknown;
  "global.Array.prototype.flat": unknown;
  "global.Array.prototype.flatMap": unknown;
  "global.Array.prototype.map": unknown;
  "global.Array.prototype.every": unknown;
  "global.Array.prototype.some": unknown;
  "global.Array.prototype.reduce": unknown;
  "global.Array.prototype.reduceRight": unknown;
  "global.Array.prototype.toReversed": unknown;
  "global.Array.prototype.toSorted": unknown;
  "global.Array.prototype.toSpliced": unknown;
  "global.Array.prototype.with": unknown;
  "global.Array.prototype.toLocaleString": unknown;
  "global.Array.prototype.toString": unknown;
  "global.Array.prototype[@@iterator]": PlainExternalReference;
};

export type IntrinsicRecord = AranIntrinsicRecord & GlobalIntrinsicRecord;

export type Naming = Map<PlainExternalReference, keyof IntrinsicRecord>;
