import { Descriptor, Reference, Value } from "./reflect";

export type Proxy = new <I, O>(
  target: Reference<I>,
  handler: ProxyHandler<I, O>,
) => Reference<O>;

export type ProxyHandler<I, O> = {
  apply: (target: Reference<I>, that: O, args: O[]) => O;
  construct: (
    target: Reference<I>,
    args: O[],
    new_target: Reference<O>,
  ) => Reference<O>;
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

export type Region<I, O> = {
  enter: (outer: O) => I;
  leave: (inner: I) => O;
};

export type Membrane<I, O> = {
  internalizeReference: (reference: Reference<O>) => Reference<I>;
  externalizeReference: (reference: Reference<I>) => Reference<O>;
};
