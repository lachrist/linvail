import type { IntrinsicRecord } from "aran";
import type {
  StandardAdvice,
  StandardAspectKind,
} from "./runtime/standard.d.ts";
import type { Advice } from "./advice.d.ts";
import type { Library } from "./library/library.d.ts";
import type { Config } from "./runtime/config.d.ts";

export const toStandardAdvice: <T>(advice: Advice) => StandardAdvice<T>;

export const createRuntime: (
  intrinsics: IntrinsicRecord,
  config: Config,
) => {
  library: Library;
  advice: Advice;
};

export const setupRuntime: (
  intrinsics: IntrinsicRecord,
  config: Config,
) => Advice;

export const standard_pointcut: StandardAspectKind[];
