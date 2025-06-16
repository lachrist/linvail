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
import type { Membrane } from "./runtime/membrane.js";

export type Region = { __brand: "Region" };

/**
 * Create a Linvail region, which represents the state required to maintain its
 * membrane.
 */
export const createRegion: (
  intrinsics: IntrinsicRecord,
  config?: PartialRegionConfig,
) => Region;

/**
 * Create a library of functions which includes wrapping and reflective
 * operations.
 */
export const createMembrane: (region: Region) => Membrane;

/**
 * Create a Linvail library.
 */
export const createLibrary: (region: Region) => Library;

/**
 * Expose a Linvail’s library for import via `linvail/library`.
 */
export const exposeLibrary: (
  library: Library,
  config: { global: typeof globalThis },
) => void;

/**
 * Create a Linvail-custom advice that implements Linvail's membrane. Requires
 * instrumentation via `linvail.weave`.
 */
export const createCustomAdvice: (
  region: Region,
  config?: PartialAdviceConfig,
) => CustomAdvice;

/**
 * Create an Aran-standard advice that implements Linvail's membrane. Requires
 * instrumentation via `aran.weaveStandard`.
 */
export const createStandardAdvice: <T>(
  region: Region,
  config?: PartialAdviceConfig,
) => StandardAdvice<T>;

/**
 * Create a host reference by shallow-cloning a guest reference. The result is
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
 * Register the Aran-specific intrinsic into the oracle to improve the
 * precision of Linvail's membrane.
 */
export const registerAranIntrinsicRecord: (
  region: Region,
  intrinsics: IntrinsicRecord,
) => void;

////////////////
// Deprecated //
////////////////

export type toHostReferenceWrapper = (
  reference: GuestReference,
  config: { kind: "object" | "array" },
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
