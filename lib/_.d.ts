import type { Atom, IntrinsicRecord, Program } from "aran";
import type { StandardAdvice, StandardAspectKind } from "./runtime/standard";
import type { Advice } from "./advice";
import type { Linvail } from "./runtime/library";

export * from "./runtime/domain";
export * from "./runtime/library";
export * from "./runtime/standard";
export * from "./advice";

export const weave: <atom extends Atom>(
  root: Program<atom>,
  config: { advice_global_variable: string },
) => Program<atom>;

export const toStandardAdvice: <T>(advice: Advice) => StandardAdvice<T>;

export const createRuntime: (
  intrinsics: IntrinsicRecord,
  config: {
    dir: (value: unknown) => void;
  },
) => {
  library: Linvail;
  advice: Advice;
};

export const standard_pointcut: StandardAspectKind[];
