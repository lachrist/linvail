import type { StandardAdvice as GenericStandardAdvice } from "aran";
import type { Value, Wrapper } from "../domain.js";

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
  ScopeValue: Wrapper;
  StackValue: Wrapper;
  OtherValue: Wrapper | Value;
}>;
