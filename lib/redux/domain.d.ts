import type { Primitive } from "../primitive";

export type PlainExternalReference = {
  __brand: "PlainExternalReference";
};

export type GuestExternalReference = {
  __brand: "GuestExternalReference";
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

export type GuestInternalReference = {
  __brand: "GuestInternalReference";
};

export type PlainInternalReference<X> =
  | InternalArray<X>
  | InternalObject<X>
  | InternalFunction<X>;

export type InternalReference<X> =
  | GuestInternalReference
  | PlainInternalReference<X>;

export type InternalValue<X> = InternalReference<X> | X;

export type ExternalReference = PlainExternalReference | GuestExternalReference;

export type ExternalValue = ExternalReference | Primitive;

export type Registery<X> = WeakSet<PlainInternalReference<X>>;
