/**
 * @type {(
 *   Aran: import("aran/lib/lang/syntax").AranIntrinsicRecord,
 * ) => import("./global").Skeleton<import("./global").Global["__Aran"]>}
 */
const cloneAran = ({
  "aran.sliceObject": sliceObject,
  "aran.get": get,
  "aran.listForInKey": listForInKey,
  "aran.createObject": createObject,
}) => ({ sliceObject, get, listForInKey, createObject });

/**
 * @type {(
 *   Linvail: import("./library").Linvail,
 * ) => import("./library").Linvail}
 */
const cloneLinvail = ({
  same,
  dir,
  Set,
  Set: { prototype: set_prototype },
  Map,
  Map: { prototype: map_prototype },
  WeakSet,
  WeakSet: { prototype: weakset_prototype },
  WeakMap,
  WeakMap: { prototype: weakmap_prototype },
}) => ({});

/**
 * @type {(
 *   config: {
 *     global: typeof globalThis,
 *     Aran: import("aran/lib/lang/syntax").AranIntrinsicRecord,
 *     Linvail: import("./library").Linvail,
 *   },
 * ) => import("./global").Global}
 */
export const cloneGlobal = ({
  global: { Proxy, undefined, TypeError, Error, Reflect, Object, Array },
  Aran,
  Linvail,
}) => {
  /** @type {import("./global").Skeleton<import("./global").Global>} */
  const global = {
    __Aran: cloneAran(Aran),
    __Linvail: {},
    Proxy: {
      __self: Proxy,
    },
    undefined,
    TypeError,
    Error,
    Reflect: {
      ...Reflect,
    },
    Object: { __self: Object, ...Object },
    Array: { __self: Array, ...Array },
  };
  return /** @type {import("./global").Global} */ (global);
};
