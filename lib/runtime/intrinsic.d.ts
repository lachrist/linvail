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
  "aran.sliceObject": {
    (
      target: InternalValue,
      exclusion: InternalValue,
    ): PlainInternalObjectWithExternalPrototype;
    (target: ExternalValue, exclusion: ExternalValue): ExternalReference;
  };
  "aran.listForInKey": {
    (target: ExternalValue): string[];
    (target: InternalValue): string[];
  };
  "aran.getValueProperty": {
    (target: ExternalValue, key: ExternalValue): ExternalValue;
  };
  "aran.createObject": {
    (
      prototype: ExternalPrototype,
      ...properties: ExternalValue[]
    ): ExternalReference;
    (
      prototype: InternalPrototype,
      ...properties: (InternalValue | ExternalValue)[]
    ): InternalReference;
  };
};

export type GlobalIntrinsicRecord = {
  "global.Proxy": new (target: any, handler: any) => GuestExternalReference;
  "global.String": (value: ExternalValue) => string;
  "global.Error": new (message: string) => Error;
  "global.TypeError": new (message: string) => Error;
  "global.undefined": undefined;
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
  "global.Function": new (...source: string[]) => Function;
  "global.Function.prototype": PlainExternalReference;
  "global.Object": {
    (): PlainInternalReference & {
      __type: "Object";
      __prototype: "External";
    };
    (value: Primitive): PlainExternalReference;
  };
  "global.Object.prototype": PlainExternalReference;
  "global.Object.is": (value1: ExternalValue, value2: ExternalValue) => boolean;
  "global.Object.hasOwn": {
    (target: Primitive, key: unknown): never;
    (target: PlainExternalReference, key: ExternalValue): boolean;
    (target: PlainInternalReference, key: ExternalValue): boolean;
  };
  "global.Object.getPrototypeOf": {
    (target: Primitive): PlainExternalReference;
    (target: PlainExternalReference): ExternalPrototype;
    (target: PlainInternalReference): InternalPrototype;
  };
  "global.Object.setPrototypeOf": {
    (target: Primitive, prototype: unknown): Primitive;
    (
      target: PlainExternalReference,
      prototype: ExternalPrototype,
    ): PlainExternalReference;
    (
      target: PlainInternalReference,
      prototype: InternalPrototype,
    ): PlainInternalReference;
  };
  "global.Object.getOwnPropertyDescriptor": (
    target: unknown,
    key: unknown,
  ) => never;
  "global.Object.defineProperty": (
    target: unknown,
    key: unknown,
    descriptor: unknown,
  ) => never;
  "global.Object.create": {
    (
      prototype: InternalPrototype,
      descriptors: {
        [key in PropertyKey]: DefineDescriptor<
          InternalValue,
          InternalReference
        >;
      },
    ): InternalReference;
    (prototype: InternalPrototype): InternalReference;
  };
  "global.Array": {
    (length: number): PlainInternalArrayWithExternalPrototype;
    (...elements: InternalValue[]): PlainInternalArrayWithExternalPrototype;
  };
  "global.Array.prototype": PlainExternalReference;
  "global.Array.of": (
    ...elements: InternalValue[]
  ) => PlainInternalArrayWithExternalPrototype;
  "global.Number": {
    (value: ExternalValue): number;
    new (value: ExternalValue): PlainExternalReference;
  };
};

export type IntrinsicRecord = AranIntrinsicRecord & GlobalIntrinsicRecord;

export type Naming = Map<PlainExternalReference, keyof IntrinsicRecord>;
