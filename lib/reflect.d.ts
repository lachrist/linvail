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
  get: Reference<X> | undefined;
  set: Reference<X> | undefined;
  configurable: boolean;
  enumerable: boolean;
};

export type Descriptor<X> = DataDescriptor<X> | AccessorDescriptor<X>;

export type Reflect = {
  get: <X>(target: null | Reference<X>, key: RawValue, receiver: X) => X;
  has: <X>(target: null | Reference<X>, key: RawValue) => boolean;
  construct: <X>(
    target: null | Reference<X>,
    args: null | X[],
    new_target: null | Reference<X>,
  ) => Reference<X>;
  apply: <X>(target: null | Reference<X>, that: X, args: null | X[]) => X;
  getPrototypeOf: <X>(target: null | Reference<X>) => null | Reference<X>;
  ownKeys: <X>(target: null | Reference<X>) => (string | symbol)[];
  isExtensible: <X>(target: null | Reference<X>) => boolean;
  set: <X>(
    target: null | Reference<X>,
    key: RawValue,
    value: X,
    receiver: X,
  ) => boolean;
  deleteProperty: <X>(target: null | Reference<X>, key: RawValue) => boolean;
  setPrototypeOf: <X>(
    target: null | Reference<X>,
    prototype: null | undefined | Reference<X>,
  ) => boolean;
  getOwnPropertyDescriptor: <X>(
    target: null | Reference<X>,
    key: RawValue,
  ) => Descriptor<X> | undefined;
  preventExtensions: <X>(target: null | Reference<X>) => boolean;
  defineProperty: <X>(
    target: null | Reference<X>,
    key: RawValue,
    descriptor: null | Descriptor<X>,
  ) => boolean;
};
