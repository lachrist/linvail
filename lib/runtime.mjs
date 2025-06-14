import { createRegion as createRegionInner } from "./runtime/region.mjs";
import { createLibrary as createLibraryInternal } from "./library/create.mjs";
import { library_hidden_variable } from "./library/library-variable.mjs";
import {
  registerOracleAran,
  registerOracleGlobal,
  registerOracleLinvail,
} from "./runtime/oracle.mjs";
import { createCustomAdvice as createCustomAdviceInner } from "./runtime/advice/custom.mjs";
import { createStandardAdvice as createStandardAdviceInner } from "./runtime/advice/standard.mjs";
import { completeAdviceConfig } from "./runtime/advice/config.mjs";
import { completeRegionConfig } from "./runtime/config.mjs";
import { internalizeGuestReference } from "./runtime/internalize.mjs";
export { internalizeGuestReference } from "./runtime/internalize.mjs";
export { standard_pointcut } from "./runtime/advice/standard.mjs";

const {
  Error,
  Reflect: { defineProperty },
} = globalThis;

/**
 * @type {(
 *   intrinsics: import("aran").IntrinsicRecord,
 *   config?: import("./runtime/config.d.ts").PartialRegionConfig,
 * ) => import("./runtime/region.d.ts").Region}
 */
export const createRegion = (intrinsics, config) => {
  const region = createRegionInner(
    intrinsics.globalThis,
    completeRegionConfig(config),
  );
  registerOracleGlobal(region, intrinsics.globalThis);
  registerOracleAran(region, intrinsics);
  return region;
};

/**
 * @type {(
 *   region: import("./runtime/region.d.ts").Region,
 *   config?: import("./runtime/advice/config.js").PartialAdviceConfig,
 * ) => import("./runtime/advice/custom.js").CustomAdvice}
 */
export const createCustomAdvice = (region, config) =>
  createCustomAdviceInner(region, completeAdviceConfig(config));

/**
 * @type {<T>(
 *   region: import("./runtime/region.d.ts").Region,
 *   config?: import("./runtime/advice/config.js").PartialAdviceConfig,
 * ) => import("./runtime/advice/standard.js").StandardAdvice<T>}
 */
export const createStandardAdvice = (region, config) =>
  createStandardAdviceInner(region, completeAdviceConfig(config));

/**
 * @type {(
 *   region: import("./runtime/region.d.ts").Region,
 * ) => import("./library/library.d.ts").Library}
 */
export const createLibrary = (region) => {
  const library = createLibraryInternal(region);
  registerOracleLinvail(region, library);
  return library;
};

/**
 * @type {(
 *   library: import("./library/library.js").Library,
 * ) => void}
 */
export const exposeLibrary = (library) => {
  const descriptor = {
    __proto__: null,
    value: library,
    writable: true,
    enumerable: false,
    configurable: true,
  };
  defineProperty(globalThis, library_hidden_variable, descriptor);
};

/**
 * @deprecated Use `createRegion`, `createCustomAdvice`, and `createLibrary` instead.
 * @type {(
 *   intrinsics: import("aran").IntrinsicRecord,
 *   config: import("./runtime/config.d.ts").PartialRegionConfig,
 * ) => {
 *   library: import("./library/library.js").Library,
 *   advice: import("./runtime/advice/custom.js").CustomAdvice & {
 *     toHostReferenceWrapper: import("./runtime.js").toHostReferenceWrapper,
 *   },
 * }}
 */
export const createRuntime = (intrinsics, config) => {
  const region = createRegion(intrinsics, config);
  const library = createLibrary(region);
  registerOracleLinvail(region, library);
  return {
    library,
    advice: {
      ...createCustomAdvice(region, {}),
      toHostReferenceWrapper: (reference, config) =>
        internalizeGuestReference(region, reference, config),
    },
  };
};

/**
 * @deprecated Use `createRegion`, `createCustomAdvice`, `createLibrary`, and `exposeLibrary` instead.
 * @type {(
 *   intrinsics: import("aran").IntrinsicRecord,
 *   config: Partial<import("./runtime/config.d.ts").RegionConfig>,
 * ) => import("./runtime/advice/custom.js").CustomAdvice & {
 *   toHostReferenceWrapper: import("./runtime.js").toHostReferenceWrapper,
 * }}
 */
export const setupRuntime = (intrinsics, config) => {
  if (library_hidden_variable in intrinsics.globalThis) {
    throw new Error("Linvail is already set up");
  }
  const { advice, library } = createRuntime(intrinsics, config);
  const descriptor = {
    __proto__: null,
    value: library,
    writable: true,
    enumerable: false,
    configurable: true,
  };
  defineProperty(intrinsics.globalThis, library_hidden_variable, descriptor);
  return advice;
};
