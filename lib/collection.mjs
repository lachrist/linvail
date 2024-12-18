const {
  Reflect: { apply },
  WeakMap: {
    prototype: {
      has: hasWeakMapInner,
      get: getWeakMapInner,
      set: setWeakMapInner,
    },
  },
  Map: {
    prototype: { has: hasMapInner, get: getMapInner, set: setMapInner },
  },
} = globalThis;

/**
 * @type {<K extends object, V>(
 *   collection: WeakMap<K, V>,
 *   key: K,
 * ) => undefined | V}
 */
export const getWeakMap = (collection, key) =>
  apply(getWeakMapInner, collection, [key]);

/**
 * @type {<K extends object, V>(
 *   collection: WeakMap<K, V>,
 *   key: K,
 * ) => boolean}
 */
export const hasWeakMap = (collection, key) =>
  apply(hasWeakMapInner, collection, [key]);

/**
 * @type {<K extends object, V>(
 *   collection: WeakMap<K, V>,
 *   key: K,
 *   value: V,
 * ) => WeakMap<K, V>}
 */
export const setWeakMap = (collection, key, value) =>
  apply(setWeakMapInner, collection, [key, value]);

/**
 * @type {<K extends object, V>(
 *   collection: Map<K, V>,
 *   key: K,
 * ) => boolean}
 */
export const hasMap = (collection, key) =>
  apply(hasMapInner, collection, [key]);

/**
 * @type {<K extends object, V>(
 *   collection: Map<K, V>,
 *   key: K,
 * ) => undefined | V}
 */
export const getMap = (collection, key) =>
  apply(getMapInner, collection, [key]);

/**
 * @type {<K extends object, V>(
 *   collection: Map<K, V>,
 *   key: K,
 *   value: V,
 * ) => Map<K, V>}
 */
export const setMap = (collection, key, value) =>
  apply(setMapInner, collection, [key, value]);
