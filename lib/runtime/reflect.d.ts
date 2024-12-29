import type { RawValue, Reference, Value } from "./domain";

export type ContextHandle<X> = {
  __brand: "ContextHandle";
  __inner: X;
};

type GenericDefineDescriptor<X, V> = {
  __proto__: null;
  value?: V;
  writable?: boolean;
  get?: Value<X>;
  set?: Value<X>;
  configurable?: boolean;
  enumerable?: boolean;
};

type DefineDescriptor<X> = GenericDefineDescriptor<X, X>;

type ContextDefineDescriptor<X> = GenericDefineDescriptor<X, ContextHandle<X>>;

export type DataDescriptor<X> = {
  __proto__: null;
  value: X;
  configurable: boolean;
  writable: boolean;
  enumerable: boolean;
};

export type AccessorDescriptor<X> = {
  __proto__: null;
  get: Value<X> | undefined;
  set: Value<X> | undefined;
  configurable: boolean;
  enumerable: boolean;
};

export type Descriptor<X> = DataDescriptor<X> | AccessorDescriptor<X>;

export type ContextDescriptor<X> =
  | DataDescriptor<ContextHandle<X>>
  | AccessorDescriptor<X>;

export type CoarseReflect = {
  construct: <X>(
    target: Value<X>,
    args: X[],
    new_target: Value<X>,
  ) => Reference<X>;
  apply: <X>(target: Value<X>, that: X, args: X[]) => X;
  isExtensible: <X>(target: Value<X>) => boolean;
  preventExtensions: <X>(target: Value<X>) => boolean;
  getPrototypeOf: <X>(target: Value<X>) => null | Reference<X>;
  setPrototypeOf: <X>(target: Value<X>, prototype: Value<X>) => boolean;
  getOwnPropertyDescriptor: <X>(
    target: Value<X>,
    key: RawValue,
  ) => ContextDescriptor<X> | undefined;
  defineProperty: <X>(
    target: Value<X>,
    key: RawValue,
    descriptor: ContextDefineDescriptor<X>,
  ) => boolean;
  deleteProperty: <X>(target: Value<X>, key: RawValue) => boolean;
  ownKeys: <X>(target: Value<X>) => (string | symbol)[];
  has: <X>(target: Value<X>, key: RawValue) => boolean;
  get: <X>(target: Value<X>, key: RawValue, receiver: X) => ContextHandle<X>;
  set: <X>(
    target: Value<X>,
    key: RawValue,
    value: ContextHandle<X>,
    receiver: X,
  ) => boolean;
};

export type Reflect<X> = {
  get: (target: Value<X>, key: RawValue, receiver: X) => X;
  has: (target: Value<X>, key: RawValue) => boolean;
  construct: (
    target: Value<X>,
    args: X[],
    new_target: Value<X>,
  ) => Reference<X>;
  apply: (target: Value<X>, that: X, args: X[]) => X;
  getPrototypeOf: (target: Value<X>) => null | Reference<X>;
  ownKeys: (target: Value<X>) => (string | symbol)[];
  isExtensible: (target: Value<X>) => boolean;
  set: (target: Value<X>, key: RawValue, value: X, receiver: X) => boolean;
  deleteProperty: (target: Value<X>, key: RawValue) => boolean;
  setPrototypeOf: (target: Value<X>, prototype: Value<X>) => boolean;
  getOwnPropertyDescriptor: (
    target: Value<X>,
    key: RawValue,
  ) => Descriptor<X> | undefined;
  preventExtensions: (target: Value<X>) => boolean;
  defineProperty: (
    target: Value<X>,
    key: RawValue,
    descriptor: DefineDescriptor<X>,
  ) => boolean;
};
