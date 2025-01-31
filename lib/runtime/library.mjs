import {
  WeakMap,
  WeakSet,
  Map,
  Set,
  addSet,
  addWeakSet,
  clearMap,
  clearSet,
  deleteMap,
  deleteSet,
  deleteWeakMap,
  deleteWeakSet,
  forEachMap,
  forEachSet,
  getMap,
  getWeakMap,
  hasMap,
  hasSet,
  hasWeakMap,
  hasWeakSet,
  setMap,
  setWeakMap,
  getMapSize,
  getSetSize,
} from "../util/collection.mjs";
import {
  atExternal,
  atInternal,
  toInternalReferenceStrict,
} from "./convert.mjs";
import { isPlainInternalClosure } from "./domain.mjs";
import { applyInternal } from "./reflect.mjs";
import { enterPseudoClosure } from "./region/closure.mjs";
import {
  enterPrimitive,
  isGuestInternalReference,
  isInternalPrimitive,
  leavePlainExternalReference,
  leavePrimitive,
} from "./region/core.mjs";
import { enterPrototype } from "./region/util.mjs";

/**
 * @type {(
 *   prototype: import("./domain").InternalPrototype,
 * ) => import("./domain").PlainInternalObject}
 */
const createPlainInternalObject = (prototype) =>
  // NB: ({__proto__}) DOES NOT SET PROTOTYPE
  /** @type {any} */ ({ __proto__: prototype });

/**
 * @type {<K extends object, V extends object>(
 *   weakmap: import("../util/collection").WeakMap<K, V>,
 *   key: K,
 *   Error: new (message: string) => Error,
 * ) => V}
 */
const getWeakMapStrict = (weakmap, key, Error) => {
  const result = getWeakMap(weakmap, key);
  if (!result) {
    throw new Error("WeakMap key not found");
  }
  return result;
};

/**
 * @type {(
 *   region: import("./region/region").Region,
 *   prototype: import("./domain").PlainInternalObject,
 *   options: {
 *     closure: (
 *       this: import("./domain").InternalValue,
 *       ...args: import("./domain").InternalValue[]
 *     ) => import("./domain").InternalValue,
 *     name: string,
 *     length: number,
 *   },
 * ) => boolean}
 */
const defineMethod = (region, prototype, { closure, name, length }) => {
  const {
    global: {
      Reflect: { defineProperty },
    },
  } = region;
  return defineProperty(prototype, name, {
    __proto__: null,
    value: enterPseudoClosure(region, closure, {
      kind: "method",
      prototype: null,
      name,
      length,
    }),
    writable: true,
    enumerable: false,
    configurable: true,
  });
};

/**
 * @type {(
 *   region: import("./region/region").Region,
 * ) => import("./domain").PlainInternalClosure}
 */
const compileWeakSetConstructor = (region) => {
  const {
    global: {
      TypeError,
      Object: {
        prototype: { __self: object_prototype },
      },
    },
  } = region;
  /**
   * @type {import("../util/collection").WeakMap<
   *   import("./domain").InternalValue,
   *   import("../util/collection").WeakSet<import("./domain").InternalValue>
   * >}
   */
  const registery = new WeakMap();
  const prototype = createPlainInternalObject(
    enterPrototype(region, object_prototype),
  );
  defineMethod(region, prototype, {
    closure(...args) {
      return enterPrimitive(
        region,
        hasWeakSet(
          getWeakMapStrict(registery, this, TypeError),
          atInternal(region, args, 0),
        ),
      );
    },
    length: 1,
    name: "has",
  });
  defineMethod(region, prototype, {
    closure(...args) {
      addWeakSet(
        getWeakMapStrict(registery, this, TypeError),
        atInternal(region, args, 0),
      );
      return this;
    },
    length: 1,
    name: "add",
  });
  defineMethod(region, prototype, {
    closure(...args) {
      return enterPrimitive(
        region,
        deleteWeakSet(
          getWeakMapStrict(registery, this, TypeError),
          atInternal(region, args, 0),
        ),
      );
    },
    length: 1,
    name: "delete",
  });
  return enterPseudoClosure(
    region,
    function () {
      if (!new.target) {
        throw new TypeError("LinvailWeakSet is a constructor");
      }
      const result = createPlainInternalObject(new.target.prototype);
      /**
       * @type {import("../util/collection").WeakSet<
       *   import("./domain").InternalValue,
       * >}
       */
      const hidden = new WeakSet();
      setWeakMap(registery, result, hidden);
      return result;
    },
    {
      kind: "constructor",
      prototype,
      name: "LinvailWeakSet",
      length: 0,
    },
  );
};

/**
 * @type {(
 *   region: import("./region/region").Region,
 * ) => import("./domain").PlainInternalClosure}
 */
const compileWeaMapConstructor = (region) => {
  const {
    global: {
      undefined,
      TypeError,
      Object: {
        prototype: { __self: object_prototype },
      },
    },
  } = region;
  /**
   * @type {import("../util/collection").WeakMap<
   *   import("./domain").InternalValue,
   *   import("../util/collection").WeakMap<
   *     import("./domain").InternalValue,
   *     import("./domain").InternalValue
   *   >
   * >}
   */
  const registery = new WeakMap();
  const prototype = createPlainInternalObject(
    enterPrototype(region, object_prototype),
  );
  defineMethod(region, prototype, {
    closure(...args) {
      return enterPrimitive(
        region,
        hasWeakMap(
          getWeakMapStrict(registery, this, TypeError),
          atInternal(region, args, 0),
        ),
      );
    },
    length: 1,
    name: "has",
  });
  defineMethod(region, prototype, {
    closure(...args) {
      return (
        getWeakMap(
          getWeakMapStrict(registery, this, TypeError),
          atInternal(region, args, 0),
        ) || enterPrimitive(region, undefined)
      );
    },
    length: 1,
    name: "get",
  });
  defineMethod(region, prototype, {
    closure(...args) {
      setWeakMap(
        getWeakMapStrict(registery, this, TypeError),
        atInternal(region, args, 0),
        atInternal(region, args, 1),
      );
      return this;
    },
    length: 2,
    name: "set",
  });
  defineMethod(region, prototype, {
    closure(...args) {
      return enterPrimitive(
        region,
        deleteWeakMap(
          getWeakMapStrict(registery, this, TypeError),
          atInternal(region, args, 0),
        ),
      );
    },
    length: 1,
    name: "delete",
  });
  return enterPseudoClosure(
    region,
    function () {
      if (!new.target) {
        throw new TypeError("LinvailWeakMap is a constructor");
      }
      const result = createPlainInternalObject(new.target.prototype);
      /**
       * @type {import("../util/collection").WeakMap<
       *   import("./domain").InternalValue,
       *   import("./domain").InternalValue,
       * >}
       */
      const hidden = new WeakMap();
      setWeakMap(registery, result, hidden);
      return result;
    },
    {
      kind: "constructor",
      prototype,
      name: "LinvailWeakMap",
      length: 0,
    },
  );
};

/**
 * @type {(
 *   region: import("./region/region").Region,
 * ) => import("./domain").PlainInternalClosure}
 */
const compileSetConstructor = (region) => {
  const {
    global: {
      undefined,
      TypeError,
      Object: {
        prototype: { __self: object_prototype },
      },
    },
  } = region;
  /**
   * @type {import("../util/collection").WeakMap<
   *   import("./domain").InternalValue,
   *   import("../util/collection").Set<import("./domain").InternalValue>
   * >}
   */
  const registery = new WeakMap();
  const prototype = createPlainInternalObject(
    enterPrototype(region, object_prototype),
  );
  defineMethod(region, prototype, {
    closure(...args) {
      return enterPrimitive(
        region,
        hasSet(
          getWeakMapStrict(registery, this, TypeError),
          atInternal(region, args, 0),
        ),
      );
    },
    length: 1,
    name: "has",
  });
  defineMethod(region, prototype, {
    closure(...args) {
      addSet(
        getWeakMapStrict(registery, this, TypeError),
        atInternal(region, args, 0),
      );
      return this;
    },
    length: 1,
    name: "add",
  });
  defineMethod(region, prototype, {
    closure(...args) {
      return enterPrimitive(
        region,
        deleteSet(
          getWeakMapStrict(registery, this, TypeError),
          atInternal(region, args, 0),
        ),
      );
    },
    length: 1,
    name: "delete",
  });
  defineMethod(region, prototype, {
    closure() {
      clearSet(getWeakMapStrict(registery, this, TypeError));
      return enterPrimitive(region, undefined);
    },
    length: 0,
    name: "clear",
  });
  defineMethod(region, prototype, {
    closure(...args) {
      const callback = atInternal(region, args, 0);
      if (isInternalPrimitive(region, callback)) {
        throw new TypeError("Callback is not a function");
      }
      const that = atInternal(region, args, 1);
      forEachSet(
        getWeakMapStrict(registery, this, TypeError),
        (value) => applyInternal(region, callback, that, [value, value, this]),
        undefined,
      );
      return enterPrimitive(region, undefined);
    },
    length: 1,
    name: "forEach",
  });
  defineMethod(region, prototype, {
    closure() {
      return enterPrimitive(
        region,
        getSetSize(getWeakMapStrict(registery, this, TypeError)),
      );
    },
    length: 0,
    name: "getSize",
  });
  return enterPseudoClosure(
    region,
    function () {
      if (!new.target) {
        throw new TypeError("LinvailSet is a constructor");
      }
      const result = createPlainInternalObject(new.target.prototype);
      setWeakMap(registery, result, new Set());
      return result;
    },
    {
      kind: "constructor",
      prototype,
      name: "LinvailSet",
      length: 0,
    },
  );
};

/**
 * @type {(
 *   region: import("./region/region").Region,
 * ) => import("./domain").PlainInternalClosure}
 */
const compileMapConstructor = (region) => {
  const {
    global: {
      undefined,
      TypeError,
      Object: {
        prototype: { __self: object_prototype },
      },
    },
  } = region;
  /**
   * @type {import("../util/collection").WeakMap<
   *   import("./domain").InternalValue,
   *   import("../util/collection").Map<
   *     import("./domain").InternalValue,
   *     import("./domain").InternalValue
   *   >
   * >}
   */
  const registery = new WeakMap();
  const prototype = createPlainInternalObject(
    enterPrototype(region, object_prototype),
  );
  defineMethod(region, prototype, {
    closure(...args) {
      return enterPrimitive(
        region,
        hasMap(
          getWeakMapStrict(registery, this, TypeError),
          atInternal(region, args, 0),
        ),
      );
    },
    length: 1,
    name: "has",
  });
  defineMethod(region, prototype, {
    closure(...args) {
      return (
        getMap(
          getWeakMapStrict(registery, this, TypeError),
          atInternal(region, args, 0),
        ) || enterPrimitive(region, undefined)
      );
    },
    length: 1,
    name: "get",
  });
  defineMethod(region, prototype, {
    closure(...args) {
      setMap(
        getWeakMapStrict(registery, this, TypeError),
        atInternal(region, args, 0),
        atInternal(region, args, 1),
      );
      return this;
    },
    length: 2,
    name: "set",
  });
  defineMethod(region, prototype, {
    closure(...args) {
      return enterPrimitive(
        region,
        deleteMap(
          getWeakMapStrict(registery, this, TypeError),
          atInternal(region, args, 0),
        ),
      );
    },
    length: 1,
    name: "delete",
  });
  defineMethod(region, prototype, {
    closure() {
      clearMap(getWeakMapStrict(registery, this, TypeError));
      return enterPrimitive(region, undefined);
    },
    length: 0,
    name: "clear",
  });
  defineMethod(region, prototype, {
    closure(...args) {
      const callback = atInternal(region, args, 0);
      if (isInternalPrimitive(region, callback)) {
        throw new TypeError("Callback is not a function");
      }
      const that = atInternal(region, args, 1);
      forEachMap(
        getWeakMapStrict(registery, this, TypeError),
        (value, key) =>
          applyInternal(region, callback, that, [value, key, this]),
        undefined,
      );
      return enterPrimitive(region, undefined);
    },
    length: 1,
    name: "forEach",
  });
  defineMethod(region, prototype, {
    closure() {
      return enterPrimitive(
        region,
        getMapSize(getWeakMapStrict(registery, this, TypeError)),
      );
    },
    length: 0,
    name: "getSize",
  });
  return enterPseudoClosure(
    region,
    function () {
      if (!new.target) {
        throw new TypeError("LinvailMap is a constructor");
      }
      const result = createPlainInternalObject(new.target.prototype);
      setWeakMap(registery, result, new Map());
      return result;
    },
    {
      kind: "constructor",
      prototype,
      name: "LinvailMap",
      length: 0,
    },
  );
};

/**
 * @type {(
 *  region: import("./region/region").Region,
 *   type: import("./domain").ExternalValue,
 * ) => "capture" | "release"}
 */
const toEventType = (region, type) => {
  if (type !== "capture" && type !== "release") {
    const {
      global: { TypeError },
    } = region;
    throw new TypeError("Invalid event type");
  }
  return type;
};

/**
 * @type {(
 *   region: import("./region/region").Region,
 *   reference: import("./domain").InternalReference,
 * ) => (primitive: import("./domain").InternalPrimitive) => void}
 */
const toEventListenerInner = (region, reference) => {
  const {
    global: {
      TypeError,
      Reflect: { apply },
    },
  } = region;
  if (isGuestInternalReference(region, reference)) {
    /** @type {object} */
    const external = /** @type {any} */ (
      leavePlainExternalReference(region, reference)
    );
    if (typeof external === "function") {
      return (primitive) => {
        external(leavePrimitive(region, primitive));
      };
    } else {
      throw new TypeError("Invalid event listener");
    }
  } else {
    const internal = reference;
    if (isPlainInternalClosure(internal)) {
      return (primitive) => {
        apply(internal, primitive, [primitive]);
      };
    } else {
      throw new TypeError("Invalid event listener");
    }
  }
};

/**
 * @type {(
 *   region: import("./region/region").Region,
 *   cache: import("../util/collection").WeakMap<
 *     import("./domain").InternalReference,
 *     (primitive: import("./domain").InternalPrimitive) => void
 *   >,
 *   reference: import("./domain").InternalReference,
 * ) => (primitive: import("./domain").InternalPrimitive) => void}
 */
const toEventListener = (region, cache, reference) => {
  const listener = getWeakMap(cache, reference);
  if (listener) {
    return listener;
  } else {
    const listener = toEventListenerInner(region, reference);
    setWeakMap(cache, reference, listener);
    return listener;
  }
};

/**
 * @type {(
 *   region: import("./region/region").Region,
 * ) => {
 *   addEventListener: import("./domain").PlainInternalClosure,
 *   removeEventListener: import("./domain").PlainInternalClosure,
 * }}
 */
const compileEventEmitter = (region) => {
  const {
    listeners,
    global: { undefined },
  } = region;
  /**
   * @type {{
   *   capture: import("../util/collection").WeakMap<
   *     import("./domain").InternalReference,
   *     (primitive: import("./domain").InternalPrimitive) => void
   *   >,
   *   release: import("../util/collection").WeakMap<
   *     import("./domain").InternalReference,
   *     (primitive: import("./domain").InternalPrimitive) => void
   *   >
   * }}
   */
  const registery = {
    capture: new WeakMap(),
    release: new WeakMap(),
  };
  return {
    addEventListener: enterPseudoClosure(
      region,
      (...args) => {
        const type = toEventType(region, atExternal(region, args, 0));
        const listener = toEventListener(
          region,
          registery[type],
          toInternalReferenceStrict(region, atInternal(region, args, 1)),
        );
        if (listeners[type]) {
          addSet(listeners[type], listener);
        } else {
          listeners[type] = new Set([listener]);
        }
        return enterPrimitive(region, undefined);
      },
      {
        kind: "arrow",
        prototype: null,
        name: "addEventListener",
        length: 2,
      },
    ),
    removeEventListener: enterPseudoClosure(
      region,
      (...args) => {
        const type = toEventType(region, atExternal(region, args, 0));
        const listener = getWeakMap(
          registery[type],
          toInternalReferenceStrict(region, atInternal(region, args, 1)),
        );
        if (listener && listeners[type]) {
          deleteSet(listeners[type], listener);
        }
        return enterPrimitive(region, undefined);
      },
      {
        kind: "arrow",
        prototype: null,
        name: "removeEventListener",
        length: 2,
      },
    ),
  };
};

/**
 * @type {(
 *   region: import("./region/region").Region,
 * ) => import("./domain").PlainInternalObject}
 */
export const createLibrary = (region) => {
  const {
    global: {
      undefined,
      console: { dir },
      Reflect: { defineProperty },
      Object: {
        prototype: { __self: object_prototype },
      },
    },
  } = region;
  const library = createPlainInternalObject(
    enterPrototype(region, object_prototype),
  );
  defineProperty(library, "dir", {
    __proto__: null,
    value: enterPseudoClosure(
      region,
      (...args) => {
        dir(atInternal(region, args, 0));
        return enterPrimitive(region, undefined);
      },
      {
        kind: "arrow",
        prototype: null,
        name: "dir",
        length: 1,
      },
    ),
    writable: true,
    enumerable: false,
    configurable: true,
  });
  defineProperty(library, "same", {
    __proto__: null,
    value: enterPseudoClosure(
      region,
      (...args) =>
        enterPrimitive(
          region,
          atInternal(region, args, 0) === atInternal(region, args, 1),
        ),
      {
        kind: "arrow",
        prototype: null,
        name: "same",
        length: 2,
      },
    ),
    writable: true,
    enumerable: false,
    configurable: true,
  });
  const { addEventListener, removeEventListener } = compileEventEmitter(region);
  defineProperty(library, "addEventListener", {
    __proto__: null,
    value: addEventListener,
    writable: true,
    enumerable: false,
    configurable: true,
  });
  defineProperty(library, "removeEventListener", {
    __proto__: null,
    value: removeEventListener,
    writable: true,
    enumerable: false,
    configurable: true,
  });
  defineProperty(library, "WeakSet", {
    __proto__: null,
    value: compileWeakSetConstructor(region),
    writable: true,
    enumerable: false,
    configurable: true,
  });
  defineProperty(library, "Set", {
    __proto__: null,
    value: compileSetConstructor(region),
    writable: true,
    enumerable: false,
    configurable: true,
  });
  defineProperty(library, "Map", {
    __proto__: null,
    value: compileMapConstructor(region),
    writable: true,
    enumerable: false,
    configurable: true,
  });
  defineProperty(library, "WeakMap", {
    __proto__: null,
    value: compileWeaMapConstructor(region),
    writable: true,
    enumerable: false,
    configurable: true,
  });
  return library;
};
