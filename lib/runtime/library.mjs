import { LinvailExecError } from "../error.mjs";
import { createEmitter } from "./emitter.mjs";

const host_global = globalThis;

const {
  Reflect: { defineProperty },
} = globalThis;

/**
 * @type {<X, P>(
 *   constructor: new () => X,
 *   prototype: P,
 * ) => { new (): X; readonly prototype: P }}
 */
const setPrototype = (constructor, prototype) => {
  if (
    !defineProperty(constructor, "prototype", {
      writable: false,
      enumerable: false,
      configurable: false,
      value: prototype,
    })
  ) {
    throw new LinvailExecError(
      "Cannot define prototype property of constructor",
      { constructor, prototype },
    );
  }
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
  /** @type {new () => import("./library").LinvailWeakMap} */
  const LinvailWeakMap = /** @type {any} */ (
    function () {
      return construct(WeakMap, [], new.target);
    }
  );
  /** @type {import("./library").LinvailWeakMapPrototype} */
  const prototype = {
    get(key) {
      return apply(getWeakMap, this, [key]);
    },
    set(key, value) {
      apply(setWeakMap, this, [key, value]);
      return this;
    },
    has(key) {
      return apply(hasWeakMap, this, [key]);
    },
    delete(key) {
      return apply(deleteWeakMap, this, [key]);
    },
  };
  return setPrototype(LinvailWeakMap, prototype);
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
  /** @type {new () => import("./library").LinvailWeakSet} */
  const LinvailWeakSet = /** @type {any} */ (
    function () {
      return construct(WeakSet, [], new.target);
    }
  );
  /** @type {import("./library").LinvailWeakSetPrototype} */
  const prototype = {
    has(value) {
      return apply(hasWeakSet, this, [value]);
    },
    add(value) {
      apply(addWeakSet, this, [value]);
      return this;
    },
    delete(value) {
      return apply(deleteWeakSet, this, [value]);
    },
  };
  return setPrototype(LinvailWeakSet, prototype);
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
  /** @type {new () => import("./library").LinvailMap} */
  const LinvailMap = /** @type {any} */ (
    function () {
      return construct(Map, [], new.target);
    }
  );
  /** @type {import("./library").LinvailMapPrototype} */
  const prototype = {
    has(key) {
      return apply(hasMap, this, [key]);
    },
    get(key) {
      return apply(getMap, this, [key]);
    },
    set(key, value) {
      apply(setMap, this, [key, value]);
      return this;
    },
    delete(key) {
      return apply(deleteMap, this, [key]);
    },
    clear() {
      apply(clearMap, this, []);
    },
    forEach(callback, thisArg) {
      apply(forEachMap, this, [callback, thisArg]);
    },
  };
  return setPrototype(LinvailMap, prototype);
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
  /** @type {new () => import("./library").LinvailSet} */
  const LinvailSet = /** @type {any} */ (
    function () {
      return construct(Set, [], new.target);
    }
  );
  /** @type {import("./library").LinvailSetPrototype} */
  const prototype = {
    has(key) {
      return apply(hasSet, this, [key]);
    },
    add(key) {
      apply(addSet, this, [key]);
      return this;
    },
    delete(key) {
      return apply(deleteSet, this, [key]);
    },
    clear() {
      apply(clearSet, this, []);
    },
    forEach(callback, thisArg) {
      apply(forEachSet, this, [callback, thisArg]);
    },
  };
  return setPrototype(LinvailSet, prototype);
};

/**
 * @type {(
 *   global: typeof globalThis,
 * ) => {
 *   library: import("./library").Linvail,
 *   emission: import("./library").Emission,
 * }}
 */
export const createLibrary = (global) => {
  const { emit: emitCapture, emitter: captures } = createEmitter();
  const { emit: emitRelease, emitter: releases } = createEmitter();
  /** @type {import("./library").Linvail} */
  const library = {
    dir: /** @type {import("./library").Linvail["dir"]} */ (global.console.dir),
    same: (value1, value2) => value1 === value2,
    WeakSet: compileWeakSetConstructor(global),
    Set: compileSetConstructor(global),
    Map: compileMapConstructor(global),
    WeakMap: compileWeaMapConstructor(global),
    captures,
    releases,
  };
  if (global !== host_global) {
    const {
      Object: { prototype: object_prototype },
      Function: { prototype: function_prototype },
      Object: { hasOwn },
      Reflect: { setPrototypeOf, ownKeys },
    } = global;
    const keys = ownKeys(library);
    for (let index = 0; index < keys.length; index++) {
      const tool = /** @type {any} */ (library)[keys[index]];
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
  return { library, emission: { emitCapture, emitRelease } };
};
