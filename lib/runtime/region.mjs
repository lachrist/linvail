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
  wrapGuestReference: (guest, kind, apply, construct) => ({
    type: "guest",
    kind,
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
    reference_registery: createSafeWeakMap([]),
    host_closure_registery: createSafeWeakMap([]),
    symbol_registery: createSafeWeakMap([]),
    shared_symbol_registery: createSafeMap([]),
    map_registery: createSafeWeakMap([]),
    weak_map_registery: createSafeWeakMap([]),
    set_registery: createSafeWeakMap([]),
    weak_set_registery: createSafeWeakMap([]),
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
