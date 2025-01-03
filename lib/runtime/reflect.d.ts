import type { Primitive } from "../primitive";
import type {
  DataDescriptor,
  DefineDescriptor,
  Descriptor,
} from "./descriptor";
import type {
  ExternalValue,
  InternalReference,
  InternalValue,
  ExternalReference,
  ExternalPrototype,
  InternalPrototype,
  GenericPlainInternalReference,
  PlainInternalReference,
  PlainExternalReference,
  NonLengthPropertyKey,
} from "./domain";

export type apply = {
  (target: Primitive, that: unknown, args: unknown): never;
  (
    target: PlainExternalReference,
    that: ExternalValue,
    args: ExternalValue[],
  ): ExternalValue;
  <T, Y>(target: () => Y, that: T, args: []): Y;
  <T, X, Y>(target: (...args: X[]) => Y, that: T, args: X[]): Y;
};

export type construct = {
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

export type preventExtensions = {
  (target: Primitive): never;
  (target: PlainExternalReference): boolean;
  (target: PlainInternalReference): boolean;
};

export type isExtensible = {
  (target: Primitive): never;
  (target: PlainExternalReference): boolean;
  (target: PlainInternalReference): boolean;
};

export type getPrototypeOf = {
  (target: Primitive): never;
  (target: PlainExternalReference): ExternalPrototype;
  (
    target: GenericPlainInternalReference & { __prototype: "Internal" },
  ): InternalPrototype;
  (
    target: GenericPlainInternalReference & { __prototype: "External" },
  ): ExternalPrototype;
};

export type setPrototypeOf = {
  (target: Primitive, prototype: unknown): never;
  (target: PlainExternalReference, prototype: ExternalPrototype): boolean;
  (
    target: GenericPlainInternalReference,
    prototype: InternalPrototype,
  ): target is GenericPlainInternalReference & { __prototype: "Internal" };
  (
    target: GenericPlainInternalReference,
    prototype: ExternalPrototype,
  ): target is GenericPlainInternalReference & { __prototype: "External" };
};

export type ownKeys = {
  (target: Primitive): never;
  (target: PlainExternalReference): (string | symbol)[];
  (target: PlainInternalReference): (string | symbol)[];
};

export type deleteProperty = {
  (target: Primitive, key: unknown): never;
  (target: PlainExternalReference, key: ExternalValue): boolean;
  (target: PlainInternalReference, key: ExternalValue): boolean;
};

export type getOwnPropertyDescriptor = {
  (target: Primitive, key: unknown): never;
  (
    target: PlainExternalReference,
    key: ExternalValue,
  ): Descriptor<ExternalValue, ExternalReference> | undefined;
  (
    target: PlainInternalReference & { __type: "Closure" | "Object" },
    key: ExternalValue,
  ): Descriptor<InternalValue, InternalReference> | undefined;
  (
    target: PlainInternalReference & { __type: "Array" },
    key: NonLengthPropertyKey,
  ): Descriptor<InternalValue, InternalReference> | undefined;
  (
    target: PlainInternalReference & { __type: "Array" },
    key: "length",
  ): DataDescriptor<number>;
};

export type defineProperty = {
  (target: Primitive, key: unknown, descriptor: unknown): never;
  (
    target: PlainExternalReference,
    key: ExternalValue,
    descriptor: DefineDescriptor<ExternalValue, ExternalValue>,
  ): boolean;
  (
    target: PlainInternalReference & { __type: "Closure" | "Object" },
    key: ExternalValue,
    descriptor: DefineDescriptor<InternalValue, InternalValue>,
  ): boolean;
  (
    target: PlainInternalReference & { __type: "Array" },
    key: NonLengthPropertyKey,
    descriptor: DefineDescriptor<InternalValue, InternalValue>,
  ): boolean;
  (
    target: PlainInternalReference & { __type: "Array" },
    key: "length",
    descriptor: DefineDescriptor<ExternalValue, ExternalValue>,
  ): boolean;
};

export type has = {
  (target: Primitive, key: unknown): never;
  (target: PlainExternalReference, key: ExternalValue): boolean;
};

export type get = {
  (target: Primitive, key: unknown, receiver: unknown): never;
  (
    target: PlainExternalReference,
    key: ExternalValue,
    receiver: ExternalValue,
  ): ExternalValue;
};

export type set = {
  (target: Primitive, key: unknown, value: unknown, receiver: unknown): never;
  (
    target: PlainExternalReference,
    key: ExternalValue,
    value: ExternalValue,
    receiver: ExternalValue,
  ): boolean;
};

export type Reflect = {
  apply: apply;
  construct: construct;
  isExtensible: isExtensible;
  preventExtensions: preventExtensions;
  getPrototypeOf: getPrototypeOf;
  setPrototypeOf: setPrototypeOf;
  getOwnPropertyDescriptor: getOwnPropertyDescriptor;
  defineProperty: defineProperty;
  deleteProperty: deleteProperty;
  ownKeys: ownKeys;
  has: has;
  get: get;
  set: set;
};
