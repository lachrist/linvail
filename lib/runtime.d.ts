import type { IntrinsicRecord } from "aran";
import type {
  StandardAdvice,
  StandardAspectKind,
} from "./runtime/advice/standard.js";
import type { CustomAdvice } from "./runtime/advice/custom.js";
import type { Library } from "./library/library.d.ts";
import type { PartialRegionConfig } from "./runtime/config.d.ts";
import type { PartialAdviceConfig } from "./runtime/advice/config.js";
import type { GuestReference } from "./linvail.js";
import type { HostReferenceWrapper } from "./runtime/domain.d.ts";

export type Region = { __brand: "Region" };

export const createRegion: (
  intrinsics: IntrinsicRecord,
  config?: PartialRegionConfig,
) => Region;

export const createCustomAdvice: (
  region: Region,
  config?: PartialAdviceConfig,
) => CustomAdvice;

export const createStandardAdvice: <T>(
  region: Region,
  config: PartialAdviceConfig,
) => StandardAdvice<T>;

export const internalizeGuestReference: (
  region: Region,
  reference: GuestReference,
  config: {
    prototype: "none" | "copy" | "Object.prototype";
  },
) => HostReferenceWrapper;

export const createLibrary: (region: Region) => Library;

export const exposeLibrary: (library: Library) => void;

export const standard_pointcut: StandardAspectKind[];

export const toStandardAdvice: <T>(advice: CustomAdvice) => StandardAdvice<T>;

export type toHostReferenceWrapper = (
  reference: GuestReference,
  config: {
    prototype: "none" | "copy" | "Object.prototype";
  },
) => HostReferenceWrapper;

/** @deprecated Use `createRegion`, `createCustomAdvice`, and `createLibrary` instead */
export const createRuntime: (
  intrinsics: IntrinsicRecord,
  config?: PartialRegionConfig,
) => {
  library: Library;
  advice: CustomAdvice & {
    toHostReferenceWrapper: toHostReferenceWrapper;
  };
};

/** @deprecated Use `createRegion`, `createCustomAdvice`, `createLibrary`, and `exposeLibrary` instead */
export const setupRuntime: (
  intrinsics: IntrinsicRecord,
  config?: PartialRegionConfig,
) => CustomAdvice & {
  toHostReferenceWrapper: toHostReferenceWrapper;
};
