const {
  Reflect: { apply, getOwnPropertyDescriptor },
  WeakMap,
  WeakMap: {
    prototype: {
      get: getWeakMap,
      has: hasWeakMap,
      set: setWeakMap,
      delete: deleteWeakMap,
    },
  },
  Map,
  Map: {
    prototype: map_prototype,
    prototype: {
      get: getMap,
      has: hasMap,
      set: setMap,
      delete: deleteMap,
      keys: listMapKey,
      values: listMapValue,
      clear: clearMap,
      entries: listMapEntry,
    },
  },
} = globalThis;

/**
 * @type {() => number}
 */
const getMapSize = /** @type {any} */ (
  getOwnPropertyDescriptor(map_prototype, "size")
).get;

export default {
  /**
   * @type {<X extends object>(
   *   x1: X,
   *   x2: X,
   * ) => boolean}
   */
  same: (x1, x2) => x1 === x2,
  WeakMap: class {
    constructor() {
      return new WeakMap();
    }
    get(key) {
      return apply(getWeakMap, this, [key]);
    }
    set(key, val) {
      return apply(setWeakMap, this, [key, val]);
    }
    has(key) {
      return apply(hasWeakMap, this, [key]);
    }
    delete(key) {
      return apply(deleteWeakMap, this, [key]);
    }
  },
  Map: class {
    constructor() {
      return new Map();
    }
    get(key) {
      return apply(getMap, this, [key]);
    }
    set(key, val) {
      return apply(setMap, this, [key, val]);
    }
    has(key) {
      return apply(hasMap, this, [key]);
    }
    delete(key) {
      return apply(deleteMap, this, [key]);
    }
    keys() {
      return apply(listMapKey, this, []);
    }
    values() {
      return apply(listMapValue, this, []);
    }
    clear() {
      return apply(clearMap, this, []);
    }
    entries() {
      return apply(listMapEntry, this, []);
    }
    get size() {
      return apply(getMapSize, this, []);
    }
    [Symbol.iterator]() {
      return apply(listMapEntry, this, []);
    }
  },
};
