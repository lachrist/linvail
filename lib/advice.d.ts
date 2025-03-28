import type {
  ExternalValue,
  InternalReference,
  InternalValue,
  InternalPrimitive,
  GuestInternalReference,
  PlainExternalReference,
  PlainInternalClosure,
  PlainInternalArray,
  RawPlainInternalClosure,
  PlainInternalArrayWithExternalPrototype,
  ExternalPrimitive,
  PlainInternalReference,
  GuestExternalReference,
} from "./runtime/domain";
import type { Program, ClosureKind } from "aran";

export type Advice = {
  addEventListener: (
    event: "capture" | "release",
    listener: (primitive: InternalPrimitive) => void,
  ) => symbol;
  removeEventListener: (event: "capture" | "release", token: symbol) => boolean;
  internalize: (
    reference: PlainExternalReference,
    config: {
      prototype: null | "global.Object.prototype" | "global.Array.prototype";
    },
  ) => PlainInternalReference;
  weaveEvalProgram: (root: Program<any>) => Program;
  isInternalPrimitive: (value: InternalValue) => value is InternalPrimitive;
  enterPrimitive: (primitive: ExternalPrimitive) => InternalPrimitive;
  leavePrimitive: (primitive: InternalPrimitive) => ExternalPrimitive;
  leaveBoolean: (value: InternalValue) => boolean;
  enterValue: (value: ExternalValue) => InternalValue;
  leaveValue: (value: InternalValue) => ExternalValue;
  apply: (
    callee: InternalValue,
    that: InternalValue,
    args: InternalValue[],
  ) => InternalValue;
  construct: (
    callee: InternalValue,
    args: InternalValue[],
  ) => InternalReference;
  enterClosure: (
    closure: RawPlainInternalClosure,
    kind: ClosureKind,
  ) => PlainInternalClosure;
  enterArgumentList: (
    reference: PlainInternalArrayWithExternalPrototype,
  ) => PlainInternalArray;
  leavePlainInternalReference: (
    reference: PlainInternalReference,
  ) => GuestExternalReference;
  enterPlainExternalReference: (
    reference: PlainExternalReference,
  ) => GuestInternalReference;
};
