import type { IntrinsicRecord } from "aran";
import type { StandardAdvice } from "./runtime/advice/standard.js";
import type { CustomAdvice } from "./runtime/advice/custom.js";
import type { Library } from "./library/library.d.ts";
import type { PartialRegionConfig } from "./runtime/config.d.ts";
import type { PartialAdviceConfig } from "./runtime/advice/config.js";
import type { GuestReference } from "./linvail.js";
import type {
  HostReferenceWrapper,
  ProxyReference,
} from "./runtime/domain.d.ts";
import type { Reflect } from "./runtime/reflect.js";

export type Region = { __brand: "Region" };

/**
 * Creates a Linvail region, which represents the state required to maintain its
 * membrane.
 */
export const createRegion: (
  intrinsics: IntrinsicRecord,
  config?: PartialRegionConfig,
) => Region;

/**
 * Creates a Linvail library.
 */
export const createLibrary: (region: Region) => Library;

/**
 * Exposes a Linvail’s library for import via `linvail/library`.
 */
export const exposeLibrary: (library: Library) => void;

/**
 * Creates a Linvail-custom advice that implements Linvail's membrane. Requires
 * instrumentation via `linvail.weave`.
 */
export const createCustomAdvice: (
  region: Region,
  config?: PartialAdviceConfig,
) => CustomAdvice;

/**
 * Creates an Aran-standard advice that implements Linvail's membrane. Requires
 * instrumentation via `aran.weaveStandard`.
 */
export const createStandardAdvice: <T>(
  region: Region,
  config?: PartialAdviceConfig,
) => StandardAdvice<T>;

/**
 * Creates a host reference by shallow-cloning a guest reference. The result is
 * a proxy reference that mediates access to the host reference.
 */
export const cloneGuestReference: (
  region: Region,
  reference: GuestReference,
  config: {
    prototype: "none" | "copy" | "Object.prototype";
  },
) => ProxyReference;

/**
 * Creates an object that ressembles the ECMAScript `Reflect` API, but operates
 * on Linvail wrapper objects.
 */
export const createReflect: (region: Region) => Reflect;

////////////////
// Deprecated //
////////////////

export type toHostReferenceWrapper = (
  reference: GuestReference,
  config: {
    prototype: "none" | "copy" | "Object.prototype";
  },
) => HostReferenceWrapper;

/**
 * @deprecated Use: `createRegion`, `createCustomAdvice`, and `createLibrary` instead */
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

/** @deprecated Use `createRegion` and `createStandardAdvice` instead */
export const toStandardAdvice: <T>(advice: CustomAdvice) => StandardAdvice<T>;
