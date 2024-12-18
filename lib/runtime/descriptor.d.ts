import type { Value } from "./reflect";

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
