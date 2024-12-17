export type Reference<X> = { __brand: "Reference"; __inner: X };

export type Primitive =
  | null
  | undefined
  | string
  | number
  | boolean
  | symbol
  | bigint;

export type Value<X> = Primitive | Reference<X>;

export type RawReference = { __brand: "Reference"; __inner: RawValue };

export type RawValue = Primitive | RawReference;

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

export type Reflect = {
  get: <X>(target: Value<X>, key: RawValue, receiver: X) => X;
  has: <X>(target: Value<X>, key: RawValue) => boolean;
  construct: <X>(
    target: Value<X>,
    args: null | X[],
    new_target: Value<X>,
  ) => Reference<X>;
  apply: <X>(target: Value<X>, that: X, args: X[]) => X;
  getPrototypeOf: <X>(target: Value<X>) => null | Reference<X>;
  ownKeys: <X>(target: Value<X>) => (string | symbol)[];
  isExtensible: <X>(target: Value<X>) => boolean;
  set: <X>(target: Value<X>, key: RawValue, value: X, receiver: X) => boolean;
  deleteProperty: <X>(target: Value<X>, key: RawValue) => boolean;
  setPrototypeOf: <X>(target: Value<X>, prototype: Value<X>) => boolean;
  getOwnPropertyDescriptor: <X>(
    target: Value<X>,
    key: RawValue,
  ) => Descriptor<X> | undefined;
  preventExtensions: <X>(target: Value<X>) => boolean;
  defineProperty: <X>(
    target: Value<X>,
    key: RawValue,
    descriptor: Descriptor<X>,
  ) => boolean;
};
