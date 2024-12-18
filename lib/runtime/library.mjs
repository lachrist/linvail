const host_global = globalThis;

/**
 * @type {<C extends new () => unknown, P>(
 *   closure: C,
 *   prototype: P,
 * ) => C & {prototype: P}}
 */
const setPrototype = (constructor, prototype) => {
  constructor.prototype = prototype;
  return constructor;
};

/**
 * @type {(
 *   global: typeof globalThis,
 * ) => import("./library").LinvailWeakMapConstructor}
 */
const compileWeaMapConstructor = (global) => {
  const {
    Reflect: { construct, apply },
    WeakMap,
    WeakMap: {
      prototype: {
        get: getWeakMap,
        has: hasWeakMap,
        set: setWeakMap,
        delete: deleteWeakMap,
      },
    },
  } = global;
  /** @type {new <X>() => import("./library").LinvailWeakMap<X>} */
  const WeakMapConstructor = /** @type {any} */ (
    function () {
      return construct(WeakMap, [], new.target);
    }
  );
  /** @type {import("./library").LinvailWeakMapPrototype} */
  const WeakMapPrototype = {
    get(key) {
      return apply(getWeakMap, this, [key]);
    },
    set(key, value) {
      return apply(setWeakMap, this, [key, value]);
    },
    has(key) {
      return apply(hasWeakMap, this, [key]);
    },
    delete(key) {
      return apply(deleteWeakMap, this, [key]);
    },
  };
  return setPrototype(WeakMapConstructor, WeakMapPrototype);
};

/**
 * @type {(
 *   global: typeof globalThis,
 * ) => import("./library").LinvailWeakSetConstructor}
 */
const compileWeakSetConstructor = (global) => {
  const {
    Reflect: { construct, apply },
    WeakSet,
    WeakSet: {
      prototype: { has: hasWeakSet, add: addWeakSet, delete: deleteWeakSet },
    },
  } = global;
  /** @type {new <X>() => import("./library").LinvailWeakSet<X>} */
  const WeakSetConstructor = /** @type {any} */ (
    function () {
      return construct(WeakSet, [], new.target);
    }
  );
  /** @type {import("./library").LinvailWeakSetPrototype} */
  const WeakSetPrototype = {
    has(value) {
      return apply(hasWeakSet, this, [value]);
    },
    add(value) {
      return apply(addWeakSet, this, [value]);
    },
    delete(value) {
      return apply(deleteWeakSet, this, [value]);
    },
  };
  return setPrototype(WeakSetConstructor, WeakSetPrototype);
};

/**
 * @type {(
 *   global: typeof globalThis,
 * ) => import("./library").LinvailMapConstructor}
 */
const compileMapConstructor = (global) => {
  const {
    Reflect: { construct, apply },
    Map,
    Map: {
      prototype: {
        get: getMap,
        has: hasMap,
        set: setMap,
        delete: deleteMap,
        clear: clearMap,
        forEach: forEachMap,
      },
    },
  } = global;
  /** @type {new <X>() => import("./library").LinvailMap<X>} */
  const MapConstructor = /** @type {any} */ (
    function () {
      return construct(Map, [], new.target);
    }
  );
  /** @type {import("./library").LinvailMapPrototype} */
  const MapPrototype = {
    has(key) {
      return apply(hasMap, this, [key]);
    },
    get(key) {
      return apply(getMap, this, [key]);
    },
    set(key, value) {
      return apply(setMap, this, [key, value]);
    },
    delete(key) {
      return apply(deleteMap, this, [key]);
    },
    clear() {
      return apply(clearMap, this, []);
    },
    forEach(callback, thisArg) {
      return apply(forEachMap, this, [callback, thisArg]);
    },
  };
  return setPrototype(MapConstructor, MapPrototype);
};

/**
 * @type {(
 *   global: typeof globalThis,
 * ) => import("./library").LinvailSetConstructor}
 */
const compileSetConstructor = (global) => {
  const {
    Reflect: { construct, apply },
    Set,
    Set: {
      prototype: {
        has: hasSet,
        add: addSet,
        delete: deleteSet,
        clear: clearSet,
        forEach: forEachSet,
      },
    },
  } = global;
  /** @type {new <X>() => import("./library").LinvailSet<X>} */
  const SetConstructor = /** @type {any} */ (
    function () {
      return construct(Set, [], new.target);
    }
  );
  /** @type {import("./library").LinvailSetPrototype} */
  const SetPrototype = {
    has(key) {
      return apply(hasSet, this, [key]);
    },
    add(key) {
      return apply(addSet, this, [key]);
    },
    delete(key) {
      return apply(deleteSet, this, [key]);
    },
    clear() {
      return apply(clearSet, this, []);
    },
    forEach(callback, thisArg) {
      return apply(forEachSet, this, [callback, thisArg]);
    },
  };
  return setPrototype(SetConstructor, SetPrototype);
};

/**
 * @type {(
 *   global: typeof globalThis,
 * ) => import("./library").Library}
 */
export const createLibrary = (global) => {
  /** @type {import("./library").Library} */
  const linvail = {
    same: (x1, x2) => x1 === x2,
    WeakSet: compileWeakSetConstructor(global),
    Set: compileSetConstructor(global),
    Map: compileMapConstructor(global),
    WeakMap: compileWeaMapConstructor(global),
  };
  if (global !== host_global) {
    const {
      Object: { prototype: object_prototype },
      Function: { prototype: function_prototype },
      Object: { hasOwn },
      Reflect: { setPrototypeOf, ownKeys },
    } = global;
    let keys = ownKeys(linvail);
    for (let index = 0; index < keys.length; index++) {
      const tool = /** @type {any} */ (linvail)[keys[index]];
      if (typeof tool === "function") {
        setPrototypeOf(tool, function_prototype);
        if (hasOwn(tool, "prototype")) {
          const { prototype } = tool;
          setPrototypeOf(prototype, object_prototype);
          const keys = ownKeys(prototype);
          for (let index = 0; index < keys.length; index++) {
            const method = prototype[keys[index]];
            if (typeof method === "function") {
              setPrototypeOf(method, function_prototype);
            }
          }
        }
      }
    }
  }
  return linvail;
};
