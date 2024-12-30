import type { Primitive } from "../primitive";
import type {
  DataDescriptor,
  DefineDescriptor,
  Descriptor,
} from "./descriptor";
import type {
  PlainExternalReference,
  ExternalValue,
  InternalArray,
  InternalReference,
  InternalValue,
  ExternalReference,
  PlainInternalReference,
} from "./domain";

export type ExternalTarget = PlainExternalReference | Primitive;

export type InternalTarget = PlainInternalReference | Primitive;

export type InternalPrototype = null | InternalReference;

export type ExternalPrototype = null | ExternalReference;

export type apply = {
  (
    target: ExternalTarget,
    that: ExternalValue,
    args: ExternalValue[],
  ): ExternalValue;
  (
    target: InternalTarget,
    that: InternalValue,
    args: InternalValue[],
  ): InternalValue;
};

export type construct = {
  (
    target: ExternalTarget,
    args: ExternalValue[],
    new_target: ExternalValue,
  ): ExternalValue;
  (
    target: InternalTarget,
    args: InternalValue[],
    new_target: InternalValue,
  ): InternalReference;
};

export type preventExtensions = {
  (target: ExternalTarget): boolean;
  (target: InternalTarget): boolean;
};

export type isExtensible = {
  (target: ExternalTarget): boolean;
  (target: InternalTarget): boolean;
};

export type getPrototypeOf = {
  (target: ExternalTarget): ExternalPrototype;
  (target: InternalTarget): InternalPrototype;
};

export type setPrototypeOf = {
  (target: ExternalTarget, prototype: ExternalPrototype): boolean;
  (target: InternalTarget, prototype: InternalPrototype): boolean;
};

export type ownKeys = {
  (target: ExternalTarget): (string | symbol)[];
  (target: InternalTarget): (string | symbol)[];
};

export type deleteProperty = {
  (target: ExternalTarget, key: ExternalValue): boolean;
  (target: InternalTarget, key: ExternalValue): boolean;
};

export type NonLengthPropertyKey = PropertyKey & {
  __brand: "NonLengthPropertyKey";
};

export type getOwnPropertyDescriptor = {
  (
    target: ExternalTarget,
    key: ExternalValue,
  ): Descriptor<ExternalValue, ExternalReference> | undefined;
  (
    target: Exclude<InternalTarget, InternalArray>,
    key: ExternalValue,
  ): Descriptor<InternalValue, InternalReference> | undefined;
  (
    target: InternalArray,
    key: NonLengthPropertyKey,
  ): Descriptor<InternalValue, InternalReference> | undefined;
  (target: InternalArray, key: "length"): DataDescriptor<number>;
};

export type defineProperty = {
  (
    target: ExternalTarget,
    key: ExternalValue,
    descriptor: DefineDescriptor<ExternalValue, ExternalValue>,
  ): boolean;
  (
    target: Exclude<InternalTarget, InternalArray>,
    key: ExternalValue,
    descriptor: DefineDescriptor<InternalValue, InternalValue>,
  ): boolean;
  (
    target: InternalArray,
    key: NonLengthPropertyKey,
    descriptor: DefineDescriptor<InternalValue, InternalValue>,
  ): boolean;
  (
    target: InternalArray,
    key: "length",
    descriptor: DefineDescriptor<ExternalValue, ExternalValue>,
  ): boolean;
};

export type has = {
  (target: ExternalTarget, key: ExternalValue): boolean;
  (target: InternalTarget, key: ExternalValue): boolean;
};

export type get = (
  target: ExternalTarget,
  key: ExternalValue,
  receiver: ExternalValue,
) => ExternalValue;

export type set = (
  target: ExternalTarget,
  key: ExternalValue,
  value: ExternalValue,
  receiver: ExternalValue,
) => boolean;

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
