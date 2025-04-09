import {
  createWeakSet,
  createWeakMap,
  createMap,
} from "../../util/collection.mjs";

/**
 * @type {(
 *   config: {
 *     record: import("../intrinsic.d.ts").IntrinsicRecord,
 *     createIntegrityFunction: () => Function,
 *     createIntegrityArrow: () => Function,
 *     generator_prototype_prototype: import("../domain.d.ts").PlainExternalReference;
 *     async_generator_prototype_prototype: import("../domain.d.ts").PlainExternalReference;
 *     dir: (
 *       value: import("../domain.d.ts").InternalValue,
 *     ) => void,
 *     count: boolean,
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
  count,
}) => ({
  ...record,
  counter: count ? { value: 1 } : null,
  naming: createMap([]),
  dir,
  createIntegrityFunction,
  createIntegrityArrow,
  generator_prototype_prototype,
  async_generator_prototype_prototype,
  listening: { active: true, capture: null, release: null },
  guest_internal_reference_registery: createWeakSet([]),
  internal_primitive_registery: createWeakSet([]),
  plain_internal_closure_kind_mapping: createWeakMap([]),
  plain_internal_reference_mapping: createWeakMap([]),
  guest_external_reference_mapping: createWeakMap([]),
  map_registery: createWeakMap([]),
  weak_map_registery: createWeakMap([]),
  set_registery: createWeakMap([]),
  weak_set_registery: createWeakMap([]),
});
