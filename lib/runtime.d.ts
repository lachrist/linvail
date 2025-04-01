import type { IntrinsicRecord } from "aran";
import type { StandardAdvice, StandardAspectKind } from "./runtime/standard";
import type { Advice } from "./advice";
import type { Library } from "./library/library";

export const toStandardAdvice: <T>(advice: Advice) => StandardAdvice<T>;

export const createRuntime: (
  intrinsics: IntrinsicRecord,
  config: {
    dir: (value: unknown) => void;
    count: boolean;
  },
) => {
  library: Library;
  advice: Advice;
};

export const setupRuntime: (
  intrinsics: IntrinsicRecord,
  config: {
    dir: (value: unknown) => void;
    count: boolean;
  },
) => Advice;

export const standard_pointcut: StandardAspectKind[];
