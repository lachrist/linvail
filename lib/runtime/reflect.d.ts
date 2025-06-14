import type {
  DefineDescriptor,
  Descriptor,
  ReferenceWrapper,
  Wrapper,
} from "./domain.js";

export type Reflect = {
  apply: (target: Wrapper, that: Wrapper, input: Wrapper[]) => Wrapper;
  construct: (
    target: Wrapper,
    input: Wrapper[],
    new_target: Wrapper,
  ) => ReferenceWrapper;
  // Prototype //
  getPrototypeOf: (target: Wrapper) => ReferenceWrapper | null;
  setPrototypeOf: (
    target: Wrapper,
    prototype: ReferenceWrapper | null,
  ) => boolean;
  // Extensibility //
  isExtensible: (target: Wrapper) => boolean;
  preventExtensions: (target: Wrapper) => boolean;
  // Own //
  ownKeys: (target: Wrapper) => (string | symbol)[];
  deleteProperty: (target: Wrapper, key: PropertyKey) => boolean;
  getOwnPropertyDescriptor: (
    target: Wrapper,
    key: PropertyKey,
  ) => undefined | Descriptor<Wrapper>;
  defineProperty: (
    target: Wrapper,
    key: PropertyKey,
    descriptor: DefineDescriptor<Wrapper>,
  ) => boolean;
  // Chain //
  has: (target: Wrapper, key: PropertyKey) => boolean;
  get: (target: Wrapper, key: PropertyKey, receiver: Wrapper) => Wrapper;
  set: (
    target: Wrapper,
    key: PropertyKey,
    value: Wrapper,
    receiver: Wrapper,
  ) => boolean;
  // Additional //
  hasOwn: (target: Wrapper, key: PropertyKey) => boolean;
};
