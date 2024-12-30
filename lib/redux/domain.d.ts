import type { Primitive as ExternalPrimitive } from "../primitive";

export { ExternalPrimitive };

export type InternalPrimitive = {
  __brand: "InternalPrimitive";
};

export type PlainExternalReference = {
  __brand: "PlainExternalReference";
};

export type GuestExternalReference = {
  __brand: "GuestExternalReference";
};

export type InternalArray = {
  __brand: "InternalArray";
};

export type InternalObject = {
  __brand: "InternalObject";
};

export type InternalFunction = {
  __brand: "InternalFunction";
};

export type GuestInternalReference = {
  __brand: "GuestInternalReference";
};

export type PlainInternalReference =
  | InternalArray
  | InternalObject
  | InternalFunction;

export type InternalReference = GuestInternalReference | PlainInternalReference;

export type InternalValue = InternalReference | InternalPrimitive;

export type ExternalReference = PlainExternalReference | GuestExternalReference;

export type ExternalValue = ExternalReference | ExternalPrimitive;
