import type { DefineDescriptor, Descriptor } from "./descriptor";
import type {
  ExternalReference,
  ExternalValue,
  InternalFunction,
  PlainInternalReference,
} from "./domain";

export type ProxyHandler = {
  apply: (
    target: InternalFunction,
    that: ExternalValue,
    args: ExternalValue[],
  ) => ExternalValue;
  construct: (
    target: InternalFunction,
    args: ExternalValue[],
    new_target: ExternalReference,
  ) => ExternalValue;
  // isExtensible: (target: InternalReference) => boolean;
  // preventExtensions: (target: InternalReference) => boolean;
  getPrototypeOf: (target: PlainInternalReference) => ExternalReference | null;
  setPrototypeOf: (
    target: PlainInternalReference,
    prototype: ExternalReference | null,
  ) => boolean;
  getOwnPropertyDescriptor: (
    target: PlainInternalReference,
    key: PropertyKey,
  ) => undefined | Descriptor<ExternalValue, ExternalValue>;
  defineProperty: (
    target: PlainInternalReference,
    key: PropertyKey,
    descriptor: DefineDescriptor<ExternalValue, ExternalReference>,
  ) => boolean;
  // deleteProperty: (target: IntrinsicInternalReference, key: PropertyKey) => boolean;
  // ownKeys: (target: IntrinsicInternalReference) => (string | symbol)[];
  has: (target: PlainInternalReference, key: PropertyKey) => boolean;
  get: (
    target: PlainInternalReference,
    key: PropertyKey,
    receiver: ExternalValue,
  ) => ExternalValue;
  set: (
    target: PlainInternalReference,
    key: PropertyKey,
    value: ExternalValue,
    receiver: ExternalValue,
  ) => boolean;
};
