import type { StandardAdvice as GenericStandardAdvice } from "aran";
import type { ExternalValue, InternalValue } from "./domain";

export type StandardAspectKind =
  | "block@declaration-overwrite"
  | "closure-block@after"
  | "program-block@after"
  | "primitive@after"
  | "intrinsic@after"
  | "closure@after"
  | "export@before"
  | "import@after"
  | "test@before"
  | "eval@before"
  | "await@before"
  | "await@after"
  | "yield@before"
  | "yield@after"
  | "apply@around"
  | "construct@around";

export type StandardAdvice<T> = GenericStandardAdvice<{
  Kind: StandardAspectKind;
  Tag: T;
  State: null;
  ScopeValue: InternalValue;
  StackValue: InternalValue;
  OtherValue: InternalValue | ExternalValue;
}>;
