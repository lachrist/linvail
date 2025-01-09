const {
  Reflect: { apply, getOwnPropertyDescriptor },
  WeakSet: WeakSetInner,
  WeakSet: {
    prototype: {
      has: hasWeakSetInner,
      add: addWeakSetInner,
      delete: deleteWeakSetInner,
    },
  },
  Set: SetInner,
  Set: {
    prototype: set_prototype,
    prototype: {
      has: hasSetInner,
      add: addSetInner,
      delete: deleteSetInner,
      forEach: forEachSetInner,
      clear: clearSetInner,
    },
  },
  WeakMap: WeakMapInner,
  WeakMap: {
    prototype: {
      has: hasWeakMapInner,
      get: getWeakMapInner,
      set: setWeakMapInner,
      delete: deleteWeakMapInner,
    },
  },
  Map: MapInner,
  Map: {
    prototype: map_prototype,
    prototype: {
      has: hasMapInner,
      get: getMapInner,
      set: setMapInner,
      delete: deleteMapInner,
      clear: clearMapInner,
      forEach: forEachMapInner,
    },
  },
} = globalThis;

const sizeMapInner = /**
 * @type {{
 *   get: <K, V>(
 *     this: import("./collection").Map<K, V>,
 *   ) => number}}
 */ (getOwnPropertyDescriptor(map_prototype, "size")).get;

const sizeSetInner = /**
 * @type {{
 *   get: <K, V>(
 *     this: import("./collection").Map<K, V>,
 *   ) => number}}
 */ (getOwnPropertyDescriptor(set_prototype, "size")).get;

/////////
// Set //
/////////

/**
 * @type {new <K>(
 *   keys?: K[],
 * ) => import("./collection").Set<K>}
 */
export const Set = /** @type {any} */ (SetInner);

/**
 * @type {<K1, K2>(
 *   collection: import("./collection").Set<K1>,
 *   key: K2,
 * ) => boolean}
 */
export const hasSet = (collection, key) =>
  apply(hasSetInner, collection, [key]);

/**
 * @type {<K1, K2 extends K1>(
 *   collection: import("./collection").Set<K1>,
 *   key: K2,
 * ) => import("./collection").Set<K1>}
 */
export const addSet = (collection, key) => {
  apply(addSetInner, collection, [key]);
  return collection;
};

/**
 * @type {<K1, K2 extends K1>(
 *   collection: import("./collection").Set<K1>,
 *   key: K2,
 * ) => boolean}
 */
export const deleteSet = (collection, key) =>
  apply(deleteSetInner, collection, [key]);

/**
 * @type {<T, K>(
 *   collection: import("./collection").Set<K>,
 *   callback: (
 *     this: T,
 *     val: K,
 *     key: K,
 *    set: import("./collection").Set<K>,
 *   ) => void,
 *   this_arg: T,
 * ) => void}
 */
export const forEachSet = (collection, callback, this_arg) =>
  apply(forEachSetInner, collection, [callback, this_arg]);

/**
 * @type {<K>(
 *   collection: import("./collection").Set<K>,
 * ) => void}
 */
export const clearSet = (collection) => apply(clearSetInner, collection, []);

/**
 * @type {<K>(
 *   collection: import("./collection").Set<K>,
 * ) => number}
 */
export const getSizeSet = (collection) => apply(sizeSetInner, collection, []);

/////////////
// WeakSet //
/////////////

/**
 * @type {new <K extends object>(
 *   keys?: K[],
 * ) => import("./collection").WeakSet<K>}
 */
export const WeakSet = /** @type {any} */ (WeakSetInner);

/**
 * @type {<K1 extends object, K2 extends object>(
 *   collection: import("./collection").WeakSet<K1>,
 *   key: K2,
 * ) => boolean}
 */
export const hasWeakSet = (collection, key) =>
  apply(hasWeakSetInner, collection, [key]);

/**
 * @type {<K1 extends object, K2 extends K1>(
 *   collection: import("./collection").WeakSet<K1>,
 *   key: K2,
 * ) => import("./collection").WeakSet<K1>}
 */
export const addWeakSet = (collection, key) => {
  apply(addWeakSetInner, collection, [key]);
  return collection;
};

/**
 * @type {<K1 extends object, K2 extends K1>(
 *   collection: import("./collection").WeakSet<K1>,
 *   key: K1,
 * ) => boolean}
 */
export const deleteWeakSet = (collection, key) =>
  apply(deleteWeakSetInner, collection, [key]);

/////////
// Map //
/////////

/**
 * @type {new <K, V>(
 *   entries?: [K, V][],
 * ) => import("./collection").Map<K, V>}
 */
export const Map = /** @type {any} */ (MapInner);

/**
 * @type {<K1, V1, K2>(
 *   collection: import("./collection").Map<K1, V1>,
 *   key: K2,
 * ) => boolean}
 */
export const hasMap = (collection, key) =>
  apply(hasMapInner, collection, [key]);

/**
 * @type {<K1, V1, K2>(
 *   collection: import("./collection").Map<K1, V1>,
 *   key: K2,
 * ) => undefined | V1}
 */
export const getMap = (collection, key) =>
  apply(getMapInner, collection, [key]);

/**
 * @type {<K1, V1, K2 extends K1, V2 extends V1>(
 *   collection: import("./collection").Map<K1, V1>,
 *   key: K2,
 *   val: V2,
 * ) => import("./collection").Map<K1, V1>}
 */
export const setMap = (collection, key, val) => {
  apply(setMapInner, collection, [key, val]);
  return collection;
};

/**
 * @type {<K1, V1, K2 extends K1>(
 *   collection: import("./collection").Map<K1, V1>,
 *   key: K2,
 * ) => boolean}
 */
export const deleteMap = (collection, key) =>
  apply(deleteMapInner, collection, [key]);

/**
 * @type {<K, V>(
 *   collection: import("./collection").Map<K, V>,
 * ) => void}
 */
export const clearMap = (collection) => apply(clearMapInner, collection, []);

/**
 * @type {<T, K, V>(
 *   collection: import("./collection").Map<K, V>,
 *   callback: (
 *     this: T,
 *     val: V,
 *     key: K,
 *     map: import("./collection").Map<K, V>,
 *   ) => void,
 *   this_arg: T,
 * ) => void}
 */
export const forEachMap = (collection, callback, this_arg) =>
  apply(forEachMapInner, collection, [callback, this_arg]);

/**
 * @type {<K, V>(
 *   collection: import("./collection").Map<K, V>,
 * ) => number}
 */
export const getSizeMap = (collection) => apply(sizeMapInner, collection, []);

/////////////
// WeakMap //
/////////////

/**
 * @type {new <K extends object, V>(
 *   entries?: [K, V][],
 * ) => import("./collection").WeakMap<K, V>}
 */
export const WeakMap = /** @type {any} */ (WeakMapInner);

/**
 * @type {<K1 extends object, V1, K2 extends object>(
 *   collection: import("./collection").WeakMap<K1, V1>,
 *   key: K2,
 * ) => undefined | V1}
 */
export const getWeakMap = (collection, key) =>
  apply(getWeakMapInner, collection, [key]);

/**
 * @type {<K1 extends object, V1, K2 extends object>(
 *   collection: import("./collection").WeakMap<K1, V1>,
 *   key: K2,
 * ) => boolean}
 */
export const hasWeakMap = (collection, key) =>
  apply(hasWeakMapInner, collection, [key]);

/**
 * @type {<K1 extends object, V1, K2 extends K1, V2 extends V1>(
 *   collection: import("./collection").WeakMap<K1 , V1>,
 *   key: K2,
 *   val: V2,
 * ) => import("./collection").WeakMap<K1, V1>}
 */
export const setWeakMap = (collection, key, val) => {
  apply(setWeakMapInner, collection, [key, val]);
  return collection;
};

/**
 * @type {<K1 extends object, V1, K2 extends K1>(
 *   collection: import("./collection").WeakMap<K1, V1>,
 *   key: K2,
 * ) => boolean}
 */
export const deleteWeakMap = (collection, key) =>
  apply(deleteWeakMapInner, collection, [key]);
