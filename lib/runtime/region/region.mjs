import {
  createWeakSet,
  createWeakMap,
  createMap,
} from "../../util/collection.mjs";

/**
 * @type {(
 *   config: {
 *     record: import("../intrinsic").IntrinsicRecord,
 *     createIntegrityFunction: () => Function,
 *     createIntegrityArrow: () => Function,
 *     generator_prototype_prototype: import("../domain").PlainExternalReference;
 *     async_generator_prototype_prototype: import("../domain").PlainExternalReference;
 *     dir: (
 *       value: import("../domain").InternalValue,
 *     ) => void,
 *   },
 * ) => import("./region").Region}
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
