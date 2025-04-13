import type { Region } from "./region.d.ts";
import type {
  DefineDescriptor,
  Descriptor,
  Reference,
  Value,
  HostReferenceWrapper,
} from "../domain.d.ts";

export type Target = {
  target: HostReferenceWrapper;
  region: Region;
};

export type GuestProxyHandler = {
  apply: (target: Target, that: Value, args: Value[]) => Value;
  construct: (target: Target, args: Value[], new_target: Reference) => Value;
  getPrototypeOf: (target: Target) => Reference | null;
  setPrototypeOf: (target: Target, prototype: Reference | null) => boolean;
  isExtensible: (target: Target) => boolean;
  preventExtensions: (target: Target) => boolean;
  getOwnPropertyDescriptor: (
    target: Target,
    key: PropertyKey,
  ) => undefined | Descriptor<Value, Value>;
  defineProperty: (
    target: Target,
    key: PropertyKey,
    descriptor: DefineDescriptor<Value, Reference>,
  ) => boolean;
  deleteProperty: (target: Target, key: PropertyKey) => boolean;
  ownKeys: (target: Target) => (string | symbol)[];
  has: (target: Target, key: PropertyKey) => boolean;
  get: (target: Target, key: PropertyKey, receiver: Value) => Value;
  set: (
    target: Target,
    key: PropertyKey,
    value: Value,
    receiver: Value,
  ) => boolean;
};
