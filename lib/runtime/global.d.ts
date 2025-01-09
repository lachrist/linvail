import type {
  DataDescriptor,
  DefineDescriptor,
  Descriptor,
  ExternalPrototype,
  ExternalReference,
  ExternalValue,
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

export type Global = {
  __Aran: {
    sliceObject: {
      (
        target: InternalValue,
        exclusion: InternalValue,
      ): PlainInternalObjectWithExternalPrototype;
      (target: ExternalValue, exclusion: ExternalValue): ExternalReference;
    };
    listForInKey: {
      (target: ExternalValue): string[];
      (target: InternalValue): string[];
    };
    get: {
      (target: ExternalValue, key: ExternalValue): ExternalValue;
    };
    createObject: {
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
  console: {
    dir: (value: InternalValue) => void;
  };
  Error: new (message: string) => Error;
  TypeError: new (message: string) => Error;
  undefined: undefined;
  Reflect: {
    apply: {
      (target: Primitive, that: unknown, args: unknown): never;
      (
        target: PlainInternalReference,
        that: InternalValue,
        args: InternalValue[],
      ): unknown;
      (
        target: PlainExternalReference,
        that: ExternalValue,
        args: ExternalValue[],
      ): ExternalValue;
      <T, Y>(target: () => Y, that: T, args: []): Y;
      <T, X, Y>(target: (...args: X[]) => Y, that: T, args: X[]): Y;
    };
    construct: {
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
    preventExtensions: {
      (target: Primitive): never;
      (target: PlainExternalReference): boolean;
      (target: PlainInternalReference): boolean;
    };
    isExtensible: {
      (target: Primitive): never;
      (target: PlainExternalReference): boolean;
      (target: PlainInternalReference): boolean;
    };
    getPrototypeOf: {
      (target: Primitive): never;
      (target: PlainExternalReference): ExternalPrototype;
      (target: PlainInternalReference): InternalPrototype;
      (target: PlainInternalArrayWithExternalPrototype): ExternalPrototype;
      (target: PlainInternalObjectWithExternalPrototype): ExternalPrototype;
      (target: RawPlainInternalClosure): ExternalPrototype;
    };
    setPrototypeOf: {
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
    ownKeys: {
      (target: Primitive): never;
      (target: PlainExternalReference): (string | symbol)[];
      (target: PlainInternalReference): (string | symbol)[];
    };
    deleteProperty: {
      (target: Primitive, key: unknown): never;
      (target: PlainExternalReference, key: ExternalValue): boolean;
      (target: PlainInternalReference, key: ExternalValue): boolean;
    };
    getOwnPropertyDescriptor: {
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
    defineProperty: {
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
    has: {
      (target: Primitive, key: unknown): never;
      (target: PlainExternalReference, key: ExternalValue): boolean;
    };
    get: {
      (target: Primitive, key: unknown, receiver: unknown): never;
      (
        target: PlainExternalReference,
        key: ExternalValue,
        receiver: ExternalValue,
      ): ExternalValue;
    };
    set: {
      (
        target: Primitive,
        key: unknown,
        value: unknown,
        receiver: unknown,
      ): never;
      (
        target: PlainExternalReference,
        key: ExternalValue,
        value: ExternalValue,
        receiver: ExternalValue,
      ): boolean;
    };
  };
  Function: {
    prototype: {
      __self: PlainExternalReference;
    };
  };
  Object: {
    __self: {
      (): PlainInternalReference & {
        __type: "Object";
        __prototype: "External";
      };
      (value: Primitive): PlainExternalReference;
    };
    prototype: {
      __self: PlainExternalReference;
    };
    hasOwn: {
      (target: Primitive, key: unknown): never;
      (target: PlainExternalReference, key: ExternalValue): boolean;
      (target: PlainInternalReference, key: ExternalValue): boolean;
    };
    getPrototypeOf: {
      (target: Primitive): PlainExternalReference;
      (target: PlainExternalReference): ExternalPrototype;
      (target: PlainInternalReference): InternalPrototype;
    };
    setPrototypeOf: {
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
    getOwnPropertyDescriptor: (target: unknown, key: unknown) => never;
    defineProperty: (
      target: unknown,
      key: unknown,
      descriptor: unknown,
    ) => never;
    create: {
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
  };
  Array: {
    __self: {
      (length: number): PlainInternalArrayWithExternalPrototype;
      (...elements: InternalValue[]): PlainInternalArrayWithExternalPrototype;
    };
    of: (
      ...elements: InternalValue[]
    ) => PlainInternalArrayWithExternalPrototype;
    prototype: {
      __self: PlainExternalReference;
    };
  };
  Number: {
    __self: {
      (value: ExternalValue): number;
      new (value: ExternalValue): PlainExternalReference;
    };
  };
};

export type Skeleton<G, X> = G extends Function
  ? X
  : G extends object
    ? { [key in keyof G]: key extends "__self" ? unknown : Skeleton<G[key], X> }
    : X;
