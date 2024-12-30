import type { DefineDescriptor, Descriptor } from "./descriptor";
import type {
  ExternalReference,
  ExternalValue,
  InternalFunction,
  PlainInternalReference,
} from "./domain";

export type ProxyHandler<X> = {
  apply: (
    target: InternalFunction<X>,
    that: ExternalValue,
    args: ExternalValue[],
  ) => ExternalValue;
  construct: (
    target: InternalFunction<X>,
    args: ExternalValue[],
    new_target: ExternalReference,
  ) => ExternalValue;
  // isExtensible: (target: InternalReference<X>) => boolean;
  // preventExtensions: (target: InternalReference<X>) => boolean;
  getPrototypeOf: (
    target: PlainInternalReference<X>,
  ) => ExternalReference | null;
  setPrototypeOf: (
    target: PlainInternalReference<X>,
    prototype: ExternalReference | null,
  ) => boolean;
  getOwnPropertyDescriptor: (
    target: PlainInternalReference<X>,
    key: PropertyKey,
  ) => undefined | Descriptor<ExternalValue, ExternalValue>;
  defineProperty: (
    target: PlainInternalReference<X>,
    key: PropertyKey,
    descriptor: DefineDescriptor<ExternalValue, ExternalReference>,
  ) => boolean;
  // deleteProperty: (target: IntrinsicInternalReference<X>, key: PropertyKey) => boolean;
  // ownKeys: (target: IntrinsicInternalReference<X>) => (string | symbol)[];
  has: (target: PlainInternalReference<X>, key: PropertyKey) => boolean;
  get: (
    target: PlainInternalReference<X>,
    key: PropertyKey,
    receiver: ExternalValue,
  ) => ExternalValue;
  set: (
    target: PlainInternalReference<X>,
    key: PropertyKey,
    value: ExternalValue,
    receiver: ExternalValue,
  ) => boolean;
};
