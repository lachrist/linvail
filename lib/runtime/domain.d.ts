import type { Primitive as ExternalPrimitive } from "../primitive";

export { ExternalPrimitive };

export type DefineDescriptor<D, A> = {
  __proto__?: null;
  value?: D;
  writable?: boolean;
  get?: A | undefined;
  set?: A | undefined;
  configurable?: boolean;
  enumerable?: boolean;
};

export type DataDescriptor<D> = {
  value: D;
  configurable: boolean;
  writable: boolean;
  enumerable: boolean;
};

export type AccessorDescriptor<A> = {
  get: A | undefined;
  set: A | undefined;
  configurable: boolean;
  enumerable: boolean;
};

export type Descriptor<D, A> = DataDescriptor<D> | AccessorDescriptor<A>;

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

export type PlainInternalArrayWithExternalPrototype = {
  __brand: "PlainInternalArrayWithExternalPrototype";
};

export type PlainInternalObjectWithExternalPrototype = {
  __brand: "PlainInternalObjectWithExternalPrototype";
};

export type RawPlainInternalClosure = {
  __brand: "RawPlainClosure";
};

export type PlainInternalArray = {
  __brand: "PlainInternalArray";
};

export type PlainInternalClosure = {
  __brand: "PlainInternalClosure";
};

export type PlainInternalObject = {
  __brand: "PlainInternalObject";
};

export type PlainInternalReference =
  | PlainInternalArray
  | PlainInternalClosure
  | PlainInternalObject;

export type InternalReference = PlainInternalReference | GuestInternalReference;

export type InternalValue = InternalReference | InternalPrimitive;

export type ExternalReference = PlainExternalReference | GuestExternalReference;

export type ExternalValue = ExternalReference | ExternalPrimitive;

export type InternalAccessor = undefined | InternalReference;

export type ExternalAccessor = undefined | ExternalReference;

export type InternalPrototype = null | InternalReference;

export type ExternalPrototype = null | ExternalReference;

export type InternalDescriptor = Descriptor<InternalValue, InternalAccessor>;

export type ExternalDescriptor = Descriptor<ExternalValue, ExternalAccessor>;

export type InternalDefineDescriptor = DefineDescriptor<
  InternalValue,
  InternalAccessor
>;

export type ExternalDefineDescriptor = DefineDescriptor<
  ExternalValue,
  ExternalAccessor
>;
