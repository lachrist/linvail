import type { Primitive } from "../primitive";

export type IntrinsicExternalReference = {
  __brand: "IntrinsicExternalReference";
};

export type ExtrinsicExternalReference = {
  __brand: "ExtrinsicExternalReference";
};

export type InternalArray<X> = {
  __brand: "InternalArray";
  __inner: X;
};

export type InternalObject<X> = {
  __brand: "InternalObject";
  __inner: X;
};

export type InternalFunction<X> = {
  __brand: "InternalFunction";
  __inner: X;
};

export type ExtrinsicInternalReference = {
  __brand: "ExtrinsicInternalReference";
};

export type IntrinsicInternalReference<X> =
  | InternalArray<X>
  | InternalObject<X>
  | InternalFunction<X>;

export type InternalReference<X> =
  | ExtrinsicInternalReference
  | IntrinsicInternalReference<X>;

export type InternalValue<X> = InternalReference<X> | X;

export type ExternalReference =
  | IntrinsicExternalReference
  | ExtrinsicExternalReference;

export type ExternalValue = ExternalReference | Primitive;

export type Registery<X> = WeakSet<IntrinsicInternalReference<X>>;
