import type { DefineDescriptor, Descriptor } from "../descriptor";
import type {
  InternalPrototype,
  InternalReference,
  InternalValue,
} from "../domain";

export type ClosureReflect = {
  apply: (
    target: InternalReference,
    that: InternalValue,
    args: InternalValue[],
  ) => InternalValue;
  construct: (
    target: InternalReference,
    args: InternalValue[],
    new_target: InternalReference,
  ) => InternalReference;
};

export type PrimaryReflect = {
  hasOwn: (target: InternalReference, key: PropertyKey) => boolean;
  isExtensible: (target: InternalReference) => boolean;
  preventExtensions: (target: InternalReference) => boolean;
  getPrototypeOf: (target: InternalReference) => InternalPrototype;
  setPrototypeOf: (
    target: InternalReference,
    prototype: InternalPrototype,
  ) => boolean;
  getOwnPropertyDescriptor: (
    target: InternalReference,
    key: PropertyKey,
  ) => undefined | Descriptor<InternalValue, InternalReference>;
  defineProperty: (
    target: InternalReference,
    key: PropertyKey,
    descriptor: DefineDescriptor<InternalValue, InternalReference>,
  ) => boolean;
  deleteProperty: (target: InternalReference, key: PropertyKey) => boolean;
  ownKeys: (target: InternalReference) => (string | symbol)[];
};

export type SecondaryReflect = {
  has: (target: InternalReference, key: PropertyKey) => boolean;
  get: (
    target: InternalReference,
    key: PropertyKey,
    receiver: InternalValue,
  ) => InternalValue;
  set: (
    target: InternalReference,
    key: PropertyKey,
    value: InternalValue,
    receiver: InternalValue,
  ) => boolean;
};

export type Reflect = ClosureReflect & PrimaryReflect & SecondaryReflect;
