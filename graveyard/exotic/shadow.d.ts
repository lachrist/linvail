import {
  Primitive as ActualPrimitive,
  Reference as ActualReference,
} from "./actual";

///////////////
// Primitive //
///////////////

export type Primitive = {
  type: "Primitive";
  primitive: ActualPrimitive;
};

export type UndefinedPrimitive = Primitive & { primitive: undefined };
export type NullPrimitive = Primitive & { primitive: null };
export type BooleanPrimitive = Primitive & { primitive: boolean };
export type NumberPrimitive = Primitive & { primitive: number };
export type StringPrimitive = Primitive & { primitive: string };
export type SymbolPrimitive = Primitive & { primitive: symbol };
export type BigIntPrimitive = Primitive & { primitive: bigint };

////////////
// Object //
////////////

export type DataDescriptor = {
  type: "data";
  configurable: BooleanPrimitive;
  enumerable: BooleanPrimitive;
  value: Value;
  writable: BooleanPrimitive;
};

export type AccessorDescriptor = {
  type: "accessor";
  configurable: BooleanPrimitive;
  enumerable: BooleanPrimitive;
  get: UndefinedPrimitive | ClosureReference;
  set: UndefinedPrimitive | ClosureReference;
};

export type Descriptor = DataDescriptor | AccessorDescriptor;

export type InnerObject = {
  kind: "plain" | "array";
  prototype: NullPrimitive | Reference;
  extensible: BooleanPrimitive;
  properties: {
    [key in string | symbol]: Descriptor;
  };
};

export type ObjectReference = {
  type: "Object";
  inner: InnerObject;
  outer: null | ActualReference;
};

/////////////
// Promise //
/////////////

export type InnerPromise = { __brand: "InnerPromise" };

export type PromiseReference = {
  type: "Promise";
  inner: InnerPromise;
  outer: null | ActualReference;
};

///////////
// Guest //
///////////

export type GuestReference = {
  type: "Guest";
  inner: null;
  outer: ActualReference;
};

/////////////
// Closure //
/////////////

export type ClosureReference = {
  type: "Closure";
  inner: Function;
  outer: null | ActualReference;
};

///////////
// Union //
///////////

export type LocalReference = ObjectReference | PromiseReference;

export type Reference = LocalReference | GuestReference;

export type Value = Primitive | Reference;
