import { createSafeWeakMap, createSafeMap } from "../util/collection.mjs";

const { Error } = globalThis;

/**
 * @type {import("./config.d.ts").Config}
 */
const default_config = {
  dir: (_value) => {
    throw new Error(
      "linvail/library.dir is disabled because config.dir is missing",
    );
  },
  wrapPrimitive: (inner) => ({
    type: "primitive",
    inner,
  }),
  wrapGuestReference: (guest, apply, construct) => ({
    type: "guest",
    inner: guest,
    apply,
    construct,
  }),
  wrapHostReference: (host, kind) => ({
    type: "host",
    kind,
    inner: null,
    plain: host,
  }),
};

/**
 * @type {(
 *   options: {
 *     intrinsics: import("./intrinsic.d.ts").IntrinsicRecord,
 *     config: Partial<import("./config.d.ts").Config>,
 *   },
 * ) => import("./region.d.ts").Region}
 */
export const createRegion = ({ intrinsics, config }) => {
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
    ...{
      ...default_config,
      ...config,
    },
    ...intrinsics,
  };
};
