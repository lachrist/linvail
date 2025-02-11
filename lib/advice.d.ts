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
} from "./runtime/domain";
import type { Program, ClosureKind } from "aran";

export type Advice = {
  weaveEvalProgram: (root: Program) => Program;
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
  enterPlainExternalReference: (
    reference: PlainExternalReference,
  ) => GuestInternalReference;
};
