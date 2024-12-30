const {
  Reflect: { apply, getOwnPropertyDescriptor },
  WeakSet: {
    prototype: {
      has: hasWeakSetInner,
      add: addWeakSetInner,
      delete: deleteWeakSetInner,
    },
  },
  Set: {
    prototype: set_prototype,
    prototype: {
      has: hasSetInner,
      add: addSetInner,
      delete: deleteSetInner,
      forEach: forEachSetInner,
    },
  },
  WeakMap: {
    prototype: {
      has: hasWeakMapInner,
      get: getWeakMapInner,
      set: setWeakMapInner,
    },
  },
  Map: {
    prototype: map_prototype,
    prototype: {
      has: hasMapInner,
      get: getMapInner,
      set: setMapInner,
      forEach: forEachMapInner,
    },
  },
} = globalThis;

const sizeMapInner = /** @type {{ get: <K, V>(this: Map<K, V>) => number}} */ (
  getOwnPropertyDescriptor(map_prototype, "size")
).get;

const sizeSetInner = /** @type {{ get: <K, V>(this: Map<K, V>) => number}} */ (
  getOwnPropertyDescriptor(set_prototype, "size")
).get;

/////////
// Set //
/////////

/**
 * @type {<K extends object>(
 *   collection: WeakSet<K>,
 *   key: K,
 * ) => boolean}
 */
export const hasSet = (collection, key) =>
  apply(hasSetInner, collection, [key]);

/**
 * @type {<K extends object>(
 *   collection: WeakSet<K>,
 *   key: K,
 * ) => WeakSet<K>}
 */
export const addSet = (collection, key) =>
  apply(addSetInner, collection, [key]);

/**
 * @type {<K extends object>(
 *   collection: WeakSet<K>,
 *   key: K,
 * ) => boolean}
 */
export const deleteSet = (collection, key) =>
  apply(deleteSetInner, collection, [key]);

/**
 * @type {<K extends object, V>(
 *   collection: Set<K>,
 *   callback: (value: K) => void,
 * ) => void}
 */
export const forEachSet = (collection, callback) =>
  apply(forEachSetInner, collection, [callback]);

/**
 * @type {<K extends object>(
 *   collection: Set<K>,
 * ) => number}
 */
export const getSizeSet = (collection) => apply(sizeSetInner, collection, []);

/////////////
// WeakSet //
/////////////

/**
 * @type {<K extends object>(
 *   collection: WeakSet<K>,
 *   key: K,
 * ) => boolean}
 */
export const hasWeakSet = (collection, key) =>
  apply(hasWeakSetInner, collection, [key]);

/**
 * @type {<K extends object>(
 *   collection: WeakSet<K>,
 *   key: K,
 * ) => WeakSet<K>}
 */
export const addWeakSet = (collection, key) =>
  apply(addWeakSetInner, collection, [key]);

/**
 * @type {<K extends object>(
 *   collection: WeakSet<K>,
 *   key: K,
 * ) => boolean}
 */
export const deleteWeakSet = (collection, key) =>
  apply(deleteWeakSetInner, collection, [key]);

/////////////
// WeakMap //
/////////////

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

/////////
// Map //
/////////

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

/**
 * @type {<K extends object, V>(
 *   collection: Map<K, V>,
 *   callback: (value: V, key: K) => void,
 * ) => void}
 */
export const forEachMap = (collection, callback) =>
  apply(forEachMapInner, collection, [callback]);

/**
 * @type {<K extends object, V>(
 *   collection: Map<K, V>,
 * ) => number}
 */
export const getSizeMap = (collection) => apply(sizeMapInner, collection, []);
