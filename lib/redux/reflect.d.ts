import type { Primitive } from "../primitive";
import type {
  DataDescriptor,
  DefineDescriptor,
  Descriptor,
} from "./descriptor";
import type {
  IntrinsicExternalReference,
  ExternalValue,
  InternalArray,
  InternalReference,
  InternalValue,
  ExternalReference,
  IntrinsicInternalReference,
} from "./domain";

export type ExternalTarget = IntrinsicExternalReference | Primitive;

export type InternalTarget<X> = IntrinsicInternalReference<X> | Primitive;

export type InternalPrototype<X> = null | InternalReference<X>;

export type ExternalPrototype = null | ExternalReference;

export type apply = {
  (
    target: ExternalTarget,
    that: ExternalValue,
    args: ExternalValue[],
  ): ExternalValue;
  <X>(
    target: InternalTarget<X>,
    that: InternalValue<X>,
    args: InternalValue<X>[],
  ): InternalValue<X>;
};

export type construct = {
  (
    target: ExternalTarget,
    args: ExternalValue[],
    new_target: ExternalValue,
  ): ExternalValue;
  <X>(
    target: InternalTarget<X>,
    args: X[],
    new_target: InternalValue<X>,
  ): InternalReference<X>;
};

export type preventExtensions = {
  (target: ExternalTarget): boolean;
  <X>(target: InternalTarget<X>): boolean;
};

export type isExtensible = {
  (target: ExternalTarget): boolean;
  <X>(target: InternalTarget<X>): boolean;
};

export type getPrototypeOf = {
  (target: ExternalTarget): ExternalPrototype;
  <X>(target: InternalTarget<X>): InternalPrototype<X>;
};

export type setPrototypeOf = {
  (target: ExternalTarget, prototype: ExternalPrototype): boolean;
  <X>(target: InternalTarget<X>, prototype: InternalPrototype<X>): boolean;
};

export type ownKeys = {
  (target: ExternalTarget): (string | symbol)[];
  <X>(target: InternalTarget<X>): (string | symbol)[];
};

export type deleteProperty = {
  (target: ExternalTarget, key: ExternalValue): boolean;
  <X>(target: InternalTarget<X>, key: ExternalValue): boolean;
};

export type getOwnPropertyDescriptor = {
  (
    target: ExternalTarget,
    key: ExternalValue,
  ): Descriptor<ExternalValue, ExternalValue> | undefined;
  <X>(
    target: Exclude<InternalTarget<X>, InternalArray<X>>,
    key: ExternalValue,
  ): Descriptor<X, InternalValue<X>> | undefined;
  <X>(
    target: InternalArray<X>,
    key: Exclude<PropertyKey, "length">,
  ): Descriptor<X, InternalValue<X>> | undefined;
  <X>(
    target: InternalArray<X>,
    key: "length",
  ): DataDescriptor<number> | undefined;
};

export type defineProperty = {
  (
    target: ExternalTarget,
    key: ExternalValue,
    descriptor: DefineDescriptor<ExternalValue, ExternalValue>,
  ): boolean;
  <X>(
    target: Exclude<InternalTarget<X>, InternalArray<X>>,
    key: ExternalValue,
    descriptor: DefineDescriptor<X, InternalValue<X>>,
  ): boolean;
  <X>(
    target: InternalArray<X>,
    key: Exclude<PropertyKey, "length">,
    descriptor: DefineDescriptor<X, InternalValue<X>>,
  ): boolean;
  <X>(
    target: InternalArray<X>,
    key: "length",
    descriptor: DefineDescriptor<ExternalValue, ExternalValue>,
  ): boolean;
};

export type has = {
  (target: ExternalTarget, key: ExternalValue): boolean;
  <X>(target: InternalTarget<X>, key: ExternalValue): boolean;
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
