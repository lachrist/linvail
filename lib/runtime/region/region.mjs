import { createWeakSet, createWeakMap } from "../../util/collection.mjs";

/**
 * @type {(
 *   config: {
 *     record: import("../intrinsic").IntrinsicRecord,
 *     naming: import("../intrinsic").Naming,
 *     createIntegrityFunction: () => Function,
 *     createIntegrityArrow: () => Function,
 *   },
 * ) => import("./region").Region}
 */
export const createRegion = ({
  record,
  naming,
  createIntegrityFunction,
  createIntegrityArrow,
}) => ({
  ...record,
  naming,
  createIntegrityFunction,
  createIntegrityArrow,
  listeners: { active: true, capture: null, release: null },
  guest_internal_reference_registery: createWeakSet([]),
  internal_primitive_registery: createWeakSet([]),
  plain_internal_closure_kind_mapping: createWeakMap([]),
  plain_internal_reference_mapping: createWeakMap([]),
  guest_external_reference_mapping: createWeakMap([]),
});
