import type { ClosureKind } from "../instrument";
import type {
  ExternalPrimitive,
  ExternalReference,
  ExternalValue,
  GuestExternalReference,
  GuestInternalReference,
  InternalPrimitive,
  InternalReference,
  InternalValue,
  PlainExternalReference,
  PlainInternalReference,
  ExternalPrototype,
  InternalPrototype,
  ExternalAccessor,
  InternalAccessor,
  PlainInternalClosure,
  RawPlainInternalClosure,
} from "./domain";

export type PrimitiveRegion = {
  isInternalPrimitive: (value: InternalValue) => value is InternalPrimitive;
  enterPrimitive: (primitive: ExternalPrimitive) => InternalPrimitive;
  leavePrimitive: (primitive: InternalPrimitive) => ExternalPrimitive;
};

export type InternalReferenceRegion = {
  isGuestExternalReference: (
    reference: ExternalReference,
  ) => reference is GuestExternalReference;
  enterPlainInternalReference: (
    reference: GuestExternalReference,
  ) => PlainInternalReference;
  leavePlainInternalReference: (
    reference: PlainInternalReference,
  ) => GuestExternalReference;
};

export type ExternalReferenceRegion = {
  isGuestInternalReference: (
    reference: InternalReference,
  ) => reference is GuestInternalReference;
  leavePlainExternalReference: (
    reference: GuestInternalReference,
  ) => PlainExternalReference;
  enterPlainExternalReference: (
    reference: PlainExternalReference,
  ) => GuestInternalReference;
};

export type ReferenceRegion = InternalReferenceRegion & ExternalReferenceRegion;

export type ClosureRegion = {
  enterPlainInternalClosure: (
    reference: RawPlainInternalClosure,
    kind: ClosureKind,
  ) => PlainInternalClosure;
  applyPlainInternalClosure: (
    closure: PlainInternalClosure,
    that: InternalValue,
    args: InternalValue[],
  ) => InternalValue;
};

export type CoreRegion = PrimitiveRegion & ReferenceRegion & ClosureRegion;

export type UtilRegion = {
  enterReference: (value: ExternalReference) => InternalReference;
  leaveReference: (value: InternalReference) => ExternalReference;
  enterValue: (value: ExternalValue) => InternalValue;
  leaveValue: (value: InternalValue) => ExternalValue;
  enterPrototype: (prototype: ExternalPrototype) => InternalPrototype;
  leavePrototype: (prototype: InternalPrototype) => ExternalPrototype;
  enterAccessor: (accessor: ExternalAccessor) => InternalAccessor;
  leaveAccessor: (accessor: InternalAccessor) => ExternalAccessor;
};

export type Region = CoreRegion & UtilRegion;
