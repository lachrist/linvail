import type { Region } from "./region.d.ts";
import type {
  DefineDescriptor,
  Descriptor,
  ExternalReference,
  ExternalValue,
  PlainInternalReference,
} from "../domain.d.ts";

export type Target = {
  target: PlainInternalReference;
  region: Region;
};

export type GuestProxyHandler = {
  apply: (
    target: Target,
    that: ExternalValue,
    args: ExternalValue[],
  ) => ExternalValue;
  construct: (
    target: Target,
    args: ExternalValue[],
    new_target: ExternalReference,
  ) => ExternalValue;
  getPrototypeOf: (target: Target) => ExternalReference | null;
  setPrototypeOf: (
    target: Target,
    prototype: ExternalReference | null,
  ) => boolean;
  isExtensible: (target: Target) => boolean;
  preventExtensions: (target: Target) => boolean;
  getOwnPropertyDescriptor: (
    target: Target,
    key: PropertyKey,
  ) => undefined | Descriptor<ExternalValue, ExternalValue>;
  defineProperty: (
    target: Target,
    key: PropertyKey,
    descriptor: DefineDescriptor<ExternalValue, ExternalReference>,
  ) => boolean;
  deleteProperty: (target: Target, key: PropertyKey) => boolean;
  ownKeys: (target: Target) => (string | symbol)[];
  has: (target: Target, key: PropertyKey) => boolean;
  get: (
    target: Target,
    key: PropertyKey,
    receiver: ExternalValue,
  ) => ExternalValue;
  set: (
    target: Target,
    key: PropertyKey,
    value: ExternalValue,
    receiver: ExternalValue,
  ) => boolean;
};
