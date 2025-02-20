/* eslint-disable local/no-method-call */

import { map } from "./array.mjs";

const {
  Reflect: { getOwnPropertyDescriptor, defineProperty },
  WeakSet,
  WeakSet: { prototype: weak_set_prototype },
  Set,
  Set: { prototype: set_prototype },
  WeakMap,
  WeakMap: { prototype: weak_map_prototype },
  Map,
  Map: { prototype: map_prototype },
} = globalThis;

/////////
// Set //
/////////

/**
 * @type {{key: string, val: unknown}[]}
 */
const set_method_entry_array = map(
  ["has", "add", "delete", "forEach", "clear", "getSize"],
  (key) => ({
    key,
    val:
      key === "getSize"
        ? /** @type {any} */ (getOwnPropertyDescriptor(set_prototype, "size"))
            .get
        : /** @type {any} */ (set_prototype)[key],
  }),
);

/**
 * @type {<K>(
 *   keys: K[],
 * ) => import("./collection").Set<K>}
 */
export const createSet = (keys) => {
  const collection = new Set(keys);
  const { length } = set_method_entry_array;
  for (let index = 0; index < length; index++) {
    const { key, val } = set_method_entry_array[index];
    defineProperty(collection, key, {
      // @ts-ignore
      __proto__: null,
      value: val,
      writable: false,
      enumerable: false,
      configurable: false,
    });
  }
  return /** @type {any} */ (collection);
};

/**
 * @type {<K1, K2>(
 *   collection: import("./collection").Set<K1>,
 *   key: K2,
 * ) => boolean}
 */
export const hasSet = (collection, key) =>
  /** @type {any} */ (collection).has(key);

/**
 * @type {<K1, K2 extends K1>(
 *   collection: import("./collection").Set<K1>,
 *   key: K2,
 * ) => import("./collection").Set<K1>}
 */
export const addSet = (collection, key) =>
  /** @type {any} */ (collection).add(key);

/**
 * @type {<K1, K2 extends K1>(
 *   collection: import("./collection").Set<K1>,
 *   key: K2,
 * ) => boolean}
 */
export const deleteSet = (collection, key) =>
  /** @type {any} */ (collection).delete(key);

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
  /** @type {any} */ (collection).forEach(callback, this_arg);

/**
 * @type {<K>(
 *   collection: import("./collection").Set<K>,
 * ) => void}
 */
export const clearSet = (collection) => /** @type {any} */ (collection).clear();

/**
 * @type {<K>(
 *   collection: import("./collection").Set<K>,
 * ) => number}
 */
export const getSetSize = (collection) =>
  /** @type {any} */ (collection).getSize();

/////////////
// WeakSet //
/////////////

/**
 * @type {{key: string, val: unknown}[]}
 */
const weak_set_method_entry_array = map(["has", "add", "delete"], (key) => ({
  key,
  val: /** @type {any} */ (weak_set_prototype)[key],
}));

/**
 * @type {<K extends object>(
 *   keys: K[],
 * ) => import("./collection").WeakSet<K>}
 */
export const createWeakSet = (keys) => {
  const collection = new WeakSet(keys);
  const { length } = weak_set_method_entry_array;
  for (let index = 0; index < length; index++) {
    const { key, val } = weak_set_method_entry_array[index];
    defineProperty(collection, key, {
      // @ts-ignore
      __proto__: null,
      value: val,
      writable: false,
      enumerable: false,
      configurable: false,
    });
  }
  return /** @type {any} */ (collection);
};

/**
 * @type {<K1 extends object, K2 extends object>(
 *   collection: import("./collection").WeakSet<K1>,
 *   key: K2,
 * ) => boolean}
 */
export const hasWeakSet = (collection, key) =>
  /** @type {any} */ (collection).has(key);

/**
 * @type {<K1 extends object, K2 extends K1>(
 *   collection: import("./collection").WeakSet<K1>,
 *   key: K2,
 * ) => import("./collection").WeakSet<K1>}
 */
export const addWeakSet = (collection, key) =>
  /** @type {any} */ (collection).add(key);

/**
 * @type {<K1 extends object, K2 extends K1>(
 *   collection: import("./collection").WeakSet<K1>,
 *   key: K1,
 * ) => boolean}
 */
export const deleteWeakSet = (collection, key) =>
  /** @type {any} */ (collection).delete(key);

/////////
// Map //
/////////

/**
 * @type {{key: string, val: unknown}[]}
 */
const map_method_entry_array = map(
  ["has", "get", "set", "delete", "clear", "forEach", "getSize"],
  (key) => ({
    key,
    val:
      key === "getSize"
        ? /** @type {any} */ (getOwnPropertyDescriptor(map_prototype, "size"))
            .get
        : /** @type {any} */ (map_prototype)[key],
  }),
);

/**
 * @type {<K, V>(
 *   entries: [K, V][],
 * ) => import("./collection").Map<K, V>}
 */
export const createMap = (entries) => {
  const collection = new Map(entries);
  const { length } = map_method_entry_array;
  for (let index = 0; index < length; index++) {
    const { key, val } = map_method_entry_array[index];
    defineProperty(collection, key, {
      // @ts-ignore
      __proto__: null,
      value: val,
      writable: false,
      enumerable: false,
      configurable: false,
    });
  }
  return /** @type {any} */ (collection);
};

/**
 * @type {<K1, V1, K2>(
 *   collection: import("./collection").Map<K1, V1>,
 *   key: K2,
 * ) => boolean}
 */
export const hasMap = (collection, key) =>
  /** @type {any} */ (collection).has(key);

/**
 * @type {<K1, V1, K2>(
 *   collection: import("./collection").Map<K1, V1>,
 *   key: K2,
 * ) => undefined | V1}
 */
export const getMap = (collection, key) =>
  /** @type {any} */ (collection).get(key);

/**
 * @type {<K1, V1, K2 extends K1, V2 extends V1>(
 *   collection: import("./collection").Map<K1, V1>,
 *   key: K2,
 *   val: V2,
 * ) => import("./collection").Map<K1, V1>}
 */
export const setMap = (collection, key, val) =>
  /** @type {any} */ (collection).set(key, val);

/**
 * @type {<K1, V1, K2 extends K1>(
 *   collection: import("./collection").Map<K1, V1>,
 *   key: K2,
 * ) => boolean}
 */
export const deleteMap = (collection, key) =>
  /** @type {any} */ (collection).delete(key);

/**
 * @type {<K, V>(
 *   collection: import("./collection").Map<K, V>,
 * ) => void}
 */
export const clearMap = (collection) => /** @type {any} */ (collection).clear();

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
  /** @type {any} */ (collection).forEach(callback, this_arg);

/**
 * @type {<K, V>(
 *   collection: import("./collection").Map<K, V>,
 * ) => number}
 */
export const getMapSize = (collection) =>
  /** @type {any} */ (collection).getSize();

/////////////
// WeakMap //
/////////////

const weak_map_method_entry_array = map(
  ["has", "get", "set", "delete"],
  (key) => ({
    key,
    val: /** @type {any} */ (weak_map_prototype)[key],
  }),
);

/**
 * @type {<K extends object, V>(
 *   entries: [K, V][],
 * ) => import("./collection").WeakMap<K, V>}
 */
export const createWeakMap = (entries) => {
  const collection = new WeakMap(entries);
  const { length } = weak_map_method_entry_array;
  for (let index = 0; index < length; index++) {
    const { key, val } = weak_map_method_entry_array[index];
    defineProperty(collection, key, {
      // @ts-ignore
      __proto__: null,
      value: val,
      writable: false,
      enumerable: false,
      configurable: false,
    });
  }
  return /** @type {any} */ (collection);
};

/**
 * @type {<K1 extends object, V1, K2 extends object>(
 *   collection: import("./collection").WeakMap<K1, V1>,
 *   key: K2,
 * ) => undefined | V1}
 */
export const getWeakMap = (collection, key) =>
  /** @type {any} */ (collection).get(key);

/**
 * @type {<K1 extends object, V1, K2 extends object>(
 *   collection: import("./collection").WeakMap<K1, V1>,
 *   key: K2,
 * ) => boolean}
 */
export const hasWeakMap = (collection, key) =>
  /** @type {any} */ (collection).has(key);

/**
 * @type {<K1 extends object, V1, K2 extends K1, V2 extends V1>(
 *   collection: import("./collection").WeakMap<K1 , V1>,
 *   key: K2,
 *   val: V2,
 * ) => import("./collection").WeakMap<K1, V1>}
 */
export const setWeakMap = (collection, key, val) =>
  /** @type {any} */ (collection).set(key, val);

/**
 * @type {<K1 extends object, V1, K2 extends K1>(
 *   collection: import("./collection").WeakMap<K1, V1>,
 *   key: K2,
 * ) => boolean}
 */
export const deleteWeakMap = (collection, key) =>
  /** @type {any} */ (collection).delete(key);
