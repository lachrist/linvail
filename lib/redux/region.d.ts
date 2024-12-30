import type {
  ExternalPrimitive,
  ExternalReference,
  GuestExternalReference,
  GuestInternalReference,
  InternalPrimitive,
  InternalReference,
  InternalValue,
  PlainExternalReference,
  PlainInternalReference,
} from "./domain";

export type PrimitiveRegion = {
  isInternalPrimitive: (value: InternalValue) => value is InternalPrimitive;
  toInternalPrimitive: (primitive: ExternalPrimitive) => InternalPrimitive;
  toExternalPrimitive: (primitive: InternalPrimitive) => ExternalPrimitive;
};

export type InternalReferenceRegion = {
  isGuestExternalReference: (
    reference: ExternalReference,
  ) => reference is GuestExternalReference;
  toPlainInternalReference: (
    reference: GuestExternalReference,
  ) => PlainInternalReference;
  toGuestExternalReference: (
    reference: PlainInternalReference,
  ) => GuestExternalReference;
};

export type ExternalReferenceRegion = {
  isGuestInternalReference: (
    reference: InternalReference,
  ) => reference is GuestInternalReference;
  toPlainExternalReference: (
    reference: GuestInternalReference,
  ) => PlainExternalReference;
  toGuestInternalReference: (
    reference: PlainExternalReference,
  ) => GuestInternalReference;
};

export type ReferenceRegion = InternalReferenceRegion & ExternalReferenceRegion;

export type Region = PrimitiveRegion & ReferenceRegion;
