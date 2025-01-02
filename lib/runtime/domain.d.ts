import type { Primitive as ExternalPrimitive, Primitive } from "../primitive";

export { ExternalPrimitive };

export type NonLengthPropertyKey = PropertyKey & {
  __brand: "NonLengthPropertyKey";
};

export type InternalPrimitive = {
  __brand: "InternalPrimitive";
};

export type PlainExternalReference = {
  __brand: "PlainExternalReference";
};

export type GuestExternalReference = {
  __brand: "GuestExternalReference";
};

export type GuestInternalReference = {
  __brand: "GuestInternalReference";
};

export type GenericPlainInternalReference = {
  __brand: "PlainInternalReference";
  __type: "Array" | "Function" | "Object";
  __prototype: "Internal" | "External";
};

export type PlainInternalArray = GenericPlainInternalReference & {
  __type: "Array";
  __prototype: "Internal";
};

export type PlainInternalFunction = GenericPlainInternalReference & {
  __type: "Function";
  __prototype: "Internal";
};

export type PlainInternalObject = GenericPlainInternalReference & {
  __type: "Object";
  __prototype: "Internal";
};

export type PlainInternalReference =
  | PlainInternalArray
  | PlainInternalFunction
  | PlainInternalObject;

export type InternalReference = PlainInternalReference | GuestInternalReference;

export type InternalValue = InternalReference | InternalPrimitive;

export type ExternalReference = PlainExternalReference | GuestExternalReference;

export type ExternalValue = ExternalReference | ExternalPrimitive;

export type ExternalTarget = PlainExternalReference | Primitive;

export type InternalTarget = PlainInternalReference | Primitive;

export type InternalAccessor = undefined | InternalReference;

export type ExternalAccessor = undefined | ExternalReference;

export type InternalPrototype = null | InternalReference;

export type ExternalPrototype = null | ExternalReference;
