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

/////////////
// WeakSet //
/////////////

/**
 * @type {{key: string, val: unknown}[]}
 */
const set_method_entry_array = map(
  ["has", "add", "delete", "forEach", "clear", "getSize"],
  (key) => ({
    key: `$${key}`,
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
 * ) => import("./collection.d.ts").SafeSet<K>}
 */
export const createSafeSet = (keys) => {
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

/////////////
// WeakSet //
/////////////

/**
 * @type {{key: string, val: unknown}[]}
 */
const weak_set_method_entry_array = map(["has", "add", "delete"], (key) => ({
  key: `$${key}`,
  val: /** @type {any} */ (weak_set_prototype)[key],
}));

/**
 * @type {<K extends object | symbol>(
 *   keys: K[],
 * ) => import("./collection.d.ts").SafeWeakSet<K>}
 */
export const createSafeWeakSet = (keys) => {
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

/////////
// Map //
/////////

/**
 * @type {{key: string, val: unknown}[]}
 */
const map_method_entry_array = map(
  ["has", "get", "set", "delete", "clear", "forEach", "getSize"],
  (key) => ({
    key: `$${key}`,
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
 * ) => import("./collection.d.ts").SafeMap<K, V>}
 */
export const createSafeMap = (entries) => {
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

/////////////
// WeakMap //
/////////////

const weak_map_method_entry_array = map(
  ["has", "get", "set", "delete"],
  (key) => ({
    key: `$${key}`,
    val: /** @type {any} */ (weak_map_prototype)[key],
  }),
);

/**
 * @type {<K extends object | symbol, V>(
 *   entries: [K, V][],
 * ) => import("./collection.d.ts").SafeWeakMap<K, V>}
 */
export const createSafeWeakMap = (entries) => {
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
