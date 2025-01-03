import type { ClosureKind } from "./instrument";
import type { Primitive } from "./primitive";
import type {
  ExternalValue,
  InternalReference,
  InternalValue,
  InternalPrimitive,
  GenericPlainInternalReference,
  GuestInternalReference,
  PlainExternalReference,
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
  enterClosure: (closure: Function, kind: ClosureKind) => InternalReference;
  enterArgumentList: (
    reference: GenericPlainInternalReference & {
      __type: "Array";
      __prototype: "External";
    },
  ) => GenericPlainInternalReference & {
    __type: "Array";
    __prototype: "Internal";
  };
  enterNewTarget: (new_target: undefined | InternalPrimitive) => InternalValue;
  enterPlainExternalReference: (
    reference: PlainExternalReference,
  ) => GuestInternalReference;
};
