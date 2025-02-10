import { WeakSet, WeakMap } from "../../util/collection.mjs";

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
  guest_internal_reference_registery: new WeakSet(),
  internal_primitive_registery: new WeakSet(),
  plain_internal_closure_kind_mapping: new WeakMap(),
  plain_internal_reference_mapping: new WeakMap(),
  guest_external_reference_mapping: new WeakMap(),
});
