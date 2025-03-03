import type { IntrinsicRecord } from "aran";
import type { StandardAdvice, StandardAspectKind } from "./runtime/standard";
import type { Advice } from "./advice";
import type { Library } from "./library/library";

export const toStandardAdvice: <T>(advice: Advice) => StandardAdvice<T>;

export const createRuntime: (
  intrinsics: IntrinsicRecord,
  config: {
    dir: (value: unknown) => void;
  },
) => {
  library: Library;
  advice: Advice;
};

export const standard_pointcut: StandardAspectKind[];
