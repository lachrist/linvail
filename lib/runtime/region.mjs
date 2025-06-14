import { createSafeWeakMap, createSafeMap } from "../util/collection.mjs";
import { cloneIntrinsic } from "./intrinsic.mjs";

/**
 * @type {(
 *   global: typeof globalThis,
 *   config: import("./config.d.ts").RegionConfig,
 * ) => import("./region.d.ts").Region}
 */
export const createRegion = (global, config) => {
  const intrinsics = cloneIntrinsic(global);
  const { ["global.eval"]: evalGlobal } = intrinsics;
  const {
    createIntegrityFunction,
    createIntegrityArrow,
    generator_prototype_prototype,
    async_generator_prototype_prototype,
  } = evalGlobal(`
    'use strict';
    const { Reflect: { getPrototypeOf } } = globalThis;
    ({
      createIntegrityFunction: () => (function () {}),
      createIntegrityArrow: () => (() => {}),
      generator_prototype_prototype: getPrototypeOf(
        (function* () {}).prototype
      ),
      async_generator_prototype_prototype: getPrototypeOf(
        (async function* () {}).prototype
      ),
    });
  `);
  return {
    reference_registry: createSafeWeakMap([]),
    host_closure_registry: createSafeWeakMap([]),
    symbol_registry: createSafeWeakMap([]),
    shared_symbol_registry: createSafeMap([]),
    map_registry: createSafeWeakMap([]),
    weak_map_registry: createSafeWeakMap([]),
    set_registry: createSafeWeakMap([]),
    weak_set_registry: createSafeWeakMap([]),
    createIntegrityArrow,
    createIntegrityFunction,
    generator_prototype_prototype,
    async_generator_prototype_prototype,
    ...config,
    ...intrinsics,
  };
};
