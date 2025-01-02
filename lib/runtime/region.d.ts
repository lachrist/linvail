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
  GenericPlainInternalReference,
  ExternalAccessor,
  InternalAccessor,
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

export type CoreRegion = PrimitiveRegion & ReferenceRegion;

export type UtilRegion = {
  enterReference: (value: ExternalReference) => InternalReference;
  leaveReference: (value: InternalReference) => ExternalReference;
  enterValue: (value: ExternalValue) => InternalValue;
  leaveValue: (value: InternalValue) => ExternalValue;
  atInternal: (args: InternalValue[], index: number) => InternalValue;
  atExternal: (args: InternalValue[], index: number) => ExternalValue;
  enterPrototype: (prototype: ExternalPrototype) => InternalPrototype;
  leavePrototype: (prototype: InternalPrototype) => ExternalPrototype;
  fromInternalPrototype: (prototype: InternalPrototype) => InternalValue;
  fromExternalPrototype: (prototype: ExternalPrototype) => InternalValue;
  enterAccessor: (accessor: ExternalAccessor) => InternalAccessor;
  leaveAccessor: (accessor: InternalAccessor) => ExternalAccessor;
  harmonizePrototype: (
    value: GenericPlainInternalReference & { __prototype: "External" },
  ) => GenericPlainInternalReference & { __prototype: "Internal" };
  toInternalReference: (value: InternalValue) => InternalReference;
  applyInternalInternal: (
    target: InternalReference,
    that: InternalValue,
    args: InternalValue[],
  ) => InternalValue;
  applyExternalInternal: (
    target: ExternalReference,
    that: InternalValue,
    args: InternalValue[],
  ) => InternalValue;
  applyInternalExternal: (
    target: InternalReference,
    that: ExternalValue,
    args: ExternalValue[],
  ) => ExternalValue;
  applyExternalExternal: (
    target: ExternalReference,
    that: ExternalValue,
    args: ExternalValue[],
  ) => ExternalValue;
};

export type Region = CoreRegion & UtilRegion;
