import { createSafeWeakMap, createSafeMap } from "../../util/collection.mjs";

/**
 * @type {(
 *   config: {
 *     record: import("../intrinsic.d.ts").IntrinsicRecord,
 *     createIntegrityFunction: () => Function,
 *     createIntegrityArrow: () => Function,
 *     generator_prototype_prototype: import("../domain.d.ts").GuestReference;
 *     async_generator_prototype_prototype: import("../domain.d.ts").GuestReference;
 *     dir: (
 *       value: import("../domain.d.ts").Wrapper,
 *     ) => void,
 *   },
 * ) => import("./region.d.ts").Region}
 */
export const createRegion = ({
  record,
  generator_prototype_prototype,
  async_generator_prototype_prototype,
  createIntegrityFunction,
  createIntegrityArrow,
  dir,
}) => ({
  ...record,
  counter: { value: 1 },
  naming: createSafeMap([]),
  dir,
  createIntegrityFunction,
  createIntegrityArrow,
  generator_prototype_prototype,
  async_generator_prototype_prototype,
  listening: { active: true, capture: null, release: null },
  reference_registery: createSafeWeakMap([]),
  host_closure_registery: createSafeWeakMap([]),
  symbol_registery: createSafeWeakMap([]),
  shared_symbol_registery: createSafeMap([]),
  map_registery: createSafeWeakMap([]),
  weak_map_registery: createSafeWeakMap([]),
  set_registery: createSafeWeakMap([]),
  weak_set_registery: createSafeWeakMap([]),
});
