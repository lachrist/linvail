import type { ClosureKind } from "./instrument";
import type { Primitive } from "./primitive";
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
} from "./runtime/domain";

export type Advice = {
  enterPrimitive: (primitive: Primitive) => InternalPrimitive;
  leaveBranch: (value: InternalValue) => boolean;
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
  enterNewTarget: (new_target: undefined | InternalReference) => InternalValue;
  enterPlainExternalReference: (
    reference: PlainExternalReference,
  ) => GuestInternalReference;
};
