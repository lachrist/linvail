import { compileGuestExternalReferenceHandler } from "./proxy.mjs";
import { WeakSet, WeakMap } from "../../util/collection.mjs";

const {
  Object: { assign },
} = globalThis;

/**
 * @type {(
 *   global: import("../global").Global,
 * ) => import(".").Region}
 */
export const createRegion = (global) => {
  /** @type {import(".").Region} */
  const region = {
    global,
    listeners: { active: true, capture: null, release: null },
    guest_internal_reference_registery: new WeakSet(),
    internal_primitive_registery: new WeakSet(),
    plain_internal_closure_kind_mapping: new WeakMap(),
    plain_internal_reference_mapping: new WeakMap(),
    guest_external_reference_mapping: new WeakMap(),
    guest_external_reference_handler: /** @type {any} */ ({ __proto__: null }),
  };
  assign(
    region.guest_external_reference_handler,
    compileGuestExternalReferenceHandler(region),
  );
  return region;
};
