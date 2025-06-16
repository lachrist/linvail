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
import { wrapCloneGuestReference } from "./runtime/clone.mjs";
export { createMembrane } from "./runtime/membrane.mjs";

const {
  Error,
  Reflect: { defineProperty },
} = globalThis;

/**
 * @type {(
 *   global: typeof globalThis,
 *   config?: import("./runtime/config.d.ts").PartialRegionConfig,
 * ) => import("./runtime/region.d.ts").Region}
 */
export const createRegion = (global, config) => {
  const region = createRegionInner(global, completeRegionConfig(config));
  for (const miss of registerOracleGlobal(region, global)) {
    const { warn } = region;
    warn(`Missing global intrinsic: ${miss}`);
  }
  return region;
};

/**
 * @type {(
 *   region: import("./runtime/region.d.ts").Region,
 *   intrinsics: import("aran").ExtraIntrinsicRecord,
 * ) => void}
 */
export const registerAranIntrinsicRecord = (region, intrinsics) => {
  for (const miss of registerOracleAran(region, intrinsics)) {
    const { warn } = region;
    warn(`Missing Aran intrinsic: ${miss}`);
  }
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
  for (const miss of registerOracleLinvail(region, library)) {
    const { warn } = region;
    warn(`Missing linvail library intrinsic: ${miss}`);
  }
  return library;
};

/**
 * @type {(
 *   library: import("./linvail.js").Library,
 *   config: {
 *     global: typeof globalThis,
 *   },
 * ) => void}
 */
export const exposeLibrary = (library, { global }) => {
  if (library_hidden_variable in global) {
    throw new Error("Linvail is already set up");
  }
  const descriptor = {
    __proto__: null,
    value: library,
    writable: true,
    enumerable: false,
    configurable: true,
  };
  defineProperty(global, library_hidden_variable, descriptor);
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
  const region = createRegion(intrinsics.globalThis, config);
  registerAranIntrinsicRecord(region, intrinsics);
  return {
    library: createLibrary(region),
    advice: {
      ...createCustomAdvice(region, {}),
      toHostReferenceWrapper: (reference, { kind }) =>
        wrapCloneGuestReference(region, kind, reference),
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
  const { advice, library } = createRuntime(intrinsics, config);
  exposeLibrary(library, { global: intrinsics.globalThis });
  return advice;
};
