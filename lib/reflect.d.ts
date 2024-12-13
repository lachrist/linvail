export type Reference<X> = { __brand: "Reference"; __inner: X };

export type Descriptor<X> = DataDescriptor<X> | AccessorDescriptor<X>;

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

export type Membrane<I, E> = {
  enterValue: (value: E) => I;
  leaveValue: (value: I) => E;
  enterReference: (target: Reference<E>) => Reference<I>;
  leaveReference: (target: Reference<I>) => Reference<E>;
};

export type ProxyHandler<I, O> = {
  apply: (target: Reference<I>, that: O, args: O[]) => O;
  construct: (target: Reference<I>, args: O[], new_target: Reference<O>) => O;
  getOwnPropertyDescriptor: (
    target: Reference<I>,
    key: PropertyKey,
  ) => Descriptor<O> | undefined;
  defineProperty: (
    target: Reference<I>,
    key: PropertyKey,
    descriptor: Descriptor<O>,
  ) => boolean;
  getPrototypeOf: (target: Reference<I>) => Reference<O> | null;
  setPrototypeOf: (
    target: Reference<I>,
    prototype: Reference<O> | null,
  ) => boolean;
  get: (target: Reference<I>, key: PropertyKey, receiver: O) => undefined | O;
  set: (
    target: Reference<I>,
    key: PropertyKey,
    value: O,
    receiver: O,
  ) => boolean;
};
