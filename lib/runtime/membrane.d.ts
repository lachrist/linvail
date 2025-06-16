import type {
  DefineDescriptor,
  Descriptor,
  GuestReference,
  HostReference,
  HostReferenceKind,
  HostReferenceWrapper,
  Primitive,
  PrimitiveWrapper,
  Reference,
  ReferenceWrapper,
  Value,
  Wrapper,
} from "./domain.js";

/**
 * Wrapping operations on diverse inputs.
 */
export type Wrapping = {
  /**
   * Wrap a primitive value.
   */
  wrapPrimitive: (value: Primitive) => PrimitiveWrapper;
  /**
   * Wrap an external reference value whether being a proxy or guest.
   */
  wrapReference: (value: Reference) => ReferenceWrapper;
  /**
   * Wrap an arbitrary external values.
   */
  wrap: (value: Value) => Wrapper;
  /**
   * Wrap a host reference; it should not have any aliases.
   */
  wrapFreshHostReference: <K extends HostReferenceKind>(
    host: HostReference,
    config: { kind: K },
  ) => HostReferenceWrapper<K>;
  /**
   * Clone (shallow) a guest reference to turn it into a host reference and
   * wraps the clone.
   */
  wrapCloneGuestReference: <K extends "object" | "array">(
    guest: GuestReference,
    config: { kind: K },
  ) => HostReferenceWrapper<K>;
};

/**
 * Similar to the builtin `Reflect` API but targets wrappers.
 */
export type Reflect = {
  // Function //
  apply: (target: Wrapper, that: Wrapper, input: Wrapper[]) => Wrapper;
  construct: (
    target: Wrapper,
    input: Wrapper[],
    new_target: Wrapper,
  ) => ReferenceWrapper;
  // Prototype //
  getPrototypeOf: (target: Wrapper) => Reference | null;
  setPrototypeOf: (target: Wrapper, prototype: Reference | null) => boolean;
  // Extensibility //
  isExtensible: (target: Wrapper) => boolean;
  preventExtensions: (target: Wrapper) => boolean;
  // Own Property //
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
  // Chain Property //
  has: (target: Wrapper, key: PropertyKey) => boolean;
  get: (target: Wrapper, key: PropertyKey, receiver: Wrapper) => Wrapper;
  set: (
    target: Wrapper,
    key: PropertyKey,
    value: Wrapper,
    receiver: Wrapper,
  ) => boolean;
};

/**
 * Additional reflective operations on wrappers.
 */
export type AdditionalReflect = {
  /**
   * Check if the target has the own property.
   */
  hasOwn: (target: Wrapper, key: PropertyKey) => boolean;
  /**
   * Indicate whether the target is an array.
   */
  isArray: (target: Wrapper) => boolean;
};

export type Membrane = Wrapping & Reflect & AdditionalReflect;
