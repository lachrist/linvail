import type { DefineDescriptor, Descriptor } from "./descriptor";
import type {
  ExternalReference,
  ExternalValue,
  InternalFunction,
  IntrinsicInternalReference,
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
    target: IntrinsicInternalReference<X>,
  ) => ExternalReference | null;
  setPrototypeOf: (
    target: IntrinsicInternalReference<X>,
    prototype: ExternalReference | null,
  ) => boolean;
  getOwnPropertyDescriptor: (
    target: IntrinsicInternalReference<X>,
    key: PropertyKey,
  ) => undefined | Descriptor<ExternalValue, ExternalValue>;
  defineProperty: (
    target: IntrinsicInternalReference<X>,
    key: PropertyKey,
    descriptor: DefineDescriptor<ExternalValue, ExternalReference>,
  ) => boolean;
  // deleteProperty: (target: IntrinsicInternalReference<X>, key: PropertyKey) => boolean;
  // ownKeys: (target: IntrinsicInternalReference<X>) => (string | symbol)[];
  has: (target: IntrinsicInternalReference<X>, key: PropertyKey) => boolean;
  get: (
    target: IntrinsicInternalReference<X>,
    key: PropertyKey,
    receiver: ExternalValue,
  ) => ExternalValue;
  set: (
    target: IntrinsicInternalReference<X>,
    key: PropertyKey,
    value: ExternalValue,
    receiver: ExternalValue,
  ) => boolean;
};
