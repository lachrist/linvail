import { compileGuestExternalReferenceHandler } from "./proxy.mjs";

export * from "./core.mjs";
export * from "./util.mjs";
export * from "./closure.mjs";
export * from "./reflect.mjs";
export * from "./convert.mjs";

const {
  WeakSet,
  WeakMap,
  Object: { assign },
} = globalThis;

/**
 * @type {(
 *   config: {
 *     global: import("../global").Global,
 *     emission: import("../library").Emission,
 *   },
 * ) => import(".").Region}
 */
export const createRegion = ({
  global,
  emission: { emitCapture, emitRelease },
}) => {
  /** @type {import(".").Region} */
  const region = {
    global,
    emitCapture,
    emitRelease,
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
