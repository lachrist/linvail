import type { IntrinsicRecord } from "aran";
import type { StandardAdvice, StandardAspectKind } from "./runtime/standard";
import type { Advice } from "./advice";
import type { Linvail } from "./runtime/library";

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
