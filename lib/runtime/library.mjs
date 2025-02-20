import { map } from "../util/array.mjs";
import {
  createSet,
  addSet,
  deleteSet,
  deleteWeakMap,
  getWeakMap,
  hasWeakMap,
  setWeakMap,
  createWeakMap,
  getSetSize,
  deleteWeakSet,
  hasWeakSet,
  addWeakSet,
  createWeakSet,
  hasSet,
  forEachSet,
  clearSet,
  createMap,
  hasMap,
  setMap,
  deleteMap,
  clearMap,
  forEachMap,
  getMapSize,
  getMap,
} from "../util/collection.mjs";
import { isPrimitive } from "../util/primitive.mjs";
import {
  defineProperty,
  toMaybeInternalReferenceStrict,
} from "./oracle/helper.mjs";
import { applyInternal, getInternalPropertyValue } from "./reflect.mjs";
import { enterReference, enterValue, leaveValue } from "./region/util.mjs";

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
    throw new Error("Incompatible receiver");
  }
  return result;
};

/**
 * @type {(
 *   region: import("./region/region").Region,
 * ) => import("./domain").PlainExternalReference}
 */
const compileIs = (_region) => {
  /**
   * @type {(
   *   val1: import("./domain").ExternalValue,
   *   val2: import("./domain").ExternalValue,
   * ) => boolean}
   */
  const is = (val1, val2) =>
    isPrimitive(val1) || isPrimitive(val2) ? false : val1 === val2;
  return /** @type {any} */ (is);
};

/**
 * @type {(
 *   region: import("./region/region").Region,
 * ) => import("./domain").PlainExternalReference}
 */
const compileDir = (region) => {
  const { dir: dirInner } = region;
  /**
   * @type {(
   *   val1: import("./domain").ExternalValue,
   * ) => void}
   */
  const dir = (val) => {
    dirInner(enterValue(region, val));
  };
  return /** @type {any} */ (dir);
};

/**
 * @type {(
 *   region: import("./region/region").Region,
 * ) => import("./domain").PlainExternalReference}
 */
const compileAddEventListener = (region) => {
  const { listening, "global.TypeError": TypeError } = region;
  /**
   * @type {(
   *   type: import("./domain").ExternalValue,
   *   listener: import("./domain").ExternalValue,
   * ) => void}
   */
  const addEventListener = (type, listener) => {
    if (type !== "capture" && type !== "release") {
      throw new TypeError("Invalid event type");
    }
    if (typeof listener !== "function") {
      throw new TypeError("Invalid event listener");
    }
    const listeners = listening[type];
    const internal_listener = enterReference(region, listener);
    if (listeners === null) {
      listening[type] = createSet([internal_listener]);
    } else {
      addSet(listeners, internal_listener);
    }
  };
  return /** @type {any} */ (addEventListener);
};

/**
 * @type {(
 *   region: import("./region/region").Region,
 * ) => import("./domain").PlainExternalReference}
 */
const compileRemoveEventListener = (region) => {
  const { listening, "global.TypeError": TypeError } = region;
  /**
   * @type {(
   *   type: import("./domain").ExternalValue,
   *   listener: import("./domain").ExternalValue,
   * ) => void}
   */
  const removeEventListener = (type, listener) => {
    if (type !== "capture" && type !== "release") {
      throw new TypeError("Invalid event type");
    }
    if (typeof listener !== "function") {
      throw new TypeError("Invalid event listener");
    }
    const listeners = listening[type];
    const internal_listener = enterReference(region, listener);
    if (listeners !== null) {
      deleteSet(listeners, internal_listener);
      if (getSetSize(listeners) === 0) {
        listening[type] = null;
      }
    }
  };
  return /** @type {any} */ (removeEventListener);
};

/**
 * @type {(
 *   region: import("./region/region").Region,
 * ) => import("./domain").ExternalReference}
 */
const compileWeakSet = (region) => {
  const {
    weak_set_registery,
    "global.Object.create": createObject,
    "global.Object.prototype": object_prototype,
    "global.TypeError": TypeError,
  } = region;
  /**
   * @type {(
   *   keys?: null | undefined | import("./domain").ExternalValue[],
   * ) => import("./domain").PlainInternalObject}
   */
  const constructor = function LinvailWeakSet(...input) {
    /** @type {undefined | import("./domain").ExternalReference} */
    const external_new_target = /** @type {any} */ (new.target);
    if (!external_new_target) {
      throw new TypeError("LinvailWeakSet is a constructor");
    }
    const internal_new_target = enterReference(region, external_new_target);
    const result = createObject(
      toMaybeInternalReferenceStrict(
        region,
        getInternalPropertyValue(
          region,
          internal_new_target,
          "prototype",
          internal_new_target,
        ),
      ),
    );
    setWeakMap(
      weak_set_registery,
      result,
      createWeakSet(
        map(input.length === 0 ? [] : (input[0] ?? []), (key) =>
          enterValue(region, key),
        ),
      ),
    );
    return result;
  };
  const prototype_descriptor = {
    __proto__: null,
    value: {
      __proto__: object_prototype,
      constructor,
      /**
       * @type {(
       *   this: import("./domain").ExternalValue,
       *   key: import("./domain").ExternalValue,
       * ) => boolean}
       */
      has(key) {
        return hasWeakSet(
          getWeakMapStrict(
            weak_set_registery,
            enterValue(region, this),
            TypeError,
          ),
          enterValue(region, key),
        );
      },
      /**
       * @type {(
       *   this: import("./domain").ExternalValue,
       *   key: import("./domain").ExternalValue,
       *   val: import("./domain").ExternalValue,
       * ) => import("./domain").ExternalValue}
       */
      add(key) {
        addWeakSet(
          getWeakMapStrict(
            weak_set_registery,
            enterValue(region, this),
            TypeError,
          ),
          enterValue(region, key),
        );
        return this;
      },
      /**
       * @type {(
       *   this: import("./domain").ExternalValue,
       *   key: import("./domain").ExternalValue,
       * ) => boolean}
       */
      delete(key) {
        return deleteWeakSet(
          getWeakMapStrict(
            weak_set_registery,
            enterValue(region, this),
            TypeError,
          ),
          enterValue(region, key),
        );
      },
    },
    writable: false,
    enumerable: false,
    configurable: false,
  };
  defineProperty(constructor, "prototype", prototype_descriptor);
  return /** @type {any} */ (constructor);
};

/**
 * @type {(
 *   region: import("./region/region").Region,
 * ) => import("./domain").ExternalReference}
 */
const compileSet = (region) => {
  const {
    set_registery,
    "global.Object.create": createObject,
    "global.Object.prototype": object_prototype,
    "global.TypeError": TypeError,
  } = region;
  /**
   * @type {(
   *   keys?: null | undefined | import("./domain").ExternalValue[],
   * ) => import("./domain").PlainInternalObject}
   */
  const constructor = function LinvailSet(...input) {
    /** @type {undefined | import("./domain").ExternalReference} */
    const external_new_target = /** @type {any} */ (new.target);
    if (!external_new_target) {
      throw new TypeError("LinvailSet is a constructor");
    }
    const internal_new_target = enterReference(region, external_new_target);
    const result = createObject(
      toMaybeInternalReferenceStrict(
        region,
        getInternalPropertyValue(
          region,
          internal_new_target,
          "prototype",
          internal_new_target,
        ),
      ),
    );
    setWeakMap(
      set_registery,
      result,
      createSet(
        map(input.length === 0 ? [] : (input[0] ?? []), (key) =>
          enterValue(region, key),
        ),
      ),
    );
    return result;
  };
  const prototype_descriptor = {
    __proto__: null,
    _value: {
      __proto__: object_prototype,
      constructor,
      /**
       * @type {(
       *   this: import("./domain").ExternalValue,
       *   key: import("./domain").ExternalValue,
       * ) => boolean}
       */
      has(key) {
        return hasSet(
          getWeakMapStrict(set_registery, enterValue(region, this), TypeError),
          enterValue(region, key),
        );
      },
      /**
       * @type {(
       *   this: import("./domain").ExternalValue,
       *   key: import("./domain").ExternalValue,
       *   val: import("./domain").ExternalValue,
       * ) => import("./domain").ExternalValue}
       */
      add(key) {
        addSet(
          getWeakMapStrict(set_registery, enterValue(region, this), TypeError),
          enterValue(region, key),
        );
        return this;
      },
      /**
       * @type {(
       *   this: import("./domain").ExternalValue,
       *   key: import("./domain").ExternalValue,
       * ) => boolean}
       */
      delete(key) {
        return deleteSet(
          getWeakMapStrict(set_registery, enterValue(region, this), TypeError),
          enterValue(region, key),
        );
      },
      /**
       * @type {(
       *   this: import("./domain").ExternalValue,
       * ) => void}
       */
      clear() {
        clearSet(
          getWeakMapStrict(set_registery, enterValue(region, this), TypeError),
        );
      },
      /**
       * @type {(
       *   this: import("./domain").ExternalValue,
       * ) => number}
       */
      getSize() {
        return getSetSize(
          getWeakMapStrict(set_registery, enterValue(region, this), TypeError),
        );
      },
      /**
       * @type {(
       *   this: import("./domain").ExternalValue,
       *   callback: import("./domain").ExternalValue,
       *   this_arg: import("./domain").ExternalValue,
       * ) => void}
       */
      forEach(callback, this_arg) {
        if (typeof callback !== "function") {
          throw new TypeError("Invalid callback");
        }
        const internal_callback = enterReference(region, callback);
        const internal_this_arg = enterValue(region, this_arg);
        const internal_this = enterValue(region, this);
        forEachSet(
          getWeakMapStrict(set_registery, internal_this, TypeError),
          (key, val) => {
            applyInternal(region, internal_callback, internal_this_arg, [
              key,
              val,
              internal_this,
            ]);
          },
          null,
        );
      },
    },
    get value() {
      return this._value;
    },
    set value(value) {
      this._value = value;
    },
    writable: false,
    enumerable: false,
    configurable: false,
  };
  defineProperty(constructor, "prototype", prototype_descriptor);
  return /** @type {any} */ (constructor);
};

/**
 * @type {(
 *   region: import("./region/region").Region,
 * ) => import("./domain").ExternalReference}
 */
const compileWeakMap = (region) => {
  const {
    weak_map_registery,
    "global.Object.create": createObject,
    "global.Object.prototype": object_prototype,
    "global.TypeError": TypeError,
    "global.undefined": undefined,
  } = region;
  /**
   * @type {(
   *   entries?: null | undefined | [
   *     import("./domain").ExternalValue,
   *     import("./domain").ExternalValue,
   *   ][],
   * ) => import("./domain").PlainInternalObject}
   */
  const constructor = function LinvailWeakMap(...input) {
    /** @type {undefined | import("./domain").ExternalReference} */
    const external_new_target = /** @type {any} */ (new.target);
    if (!external_new_target) {
      throw new TypeError("LinvailWeakMap is a constructor");
    }
    const internal_new_target = enterReference(region, external_new_target);
    const result = createObject(
      toMaybeInternalReferenceStrict(
        region,
        getInternalPropertyValue(
          region,
          internal_new_target,
          "prototype",
          internal_new_target,
        ),
      ),
    );
    setWeakMap(
      weak_map_registery,
      result,
      createWeakMap(
        map(
          input.length === 0 ? [] : (input[0] ?? []),
          ({ 0: key, 1: val }) => [
            enterValue(region, key),
            enterValue(region, val),
          ],
        ),
      ),
    );
    return result;
  };
  const prototype_descriptor = {
    __proto__: null,
    value: {
      __proto__: object_prototype,
      constructor,
      /**
       * @type {(
       *   this: import("./domain").ExternalValue,
       *   key: import("./domain").ExternalValue,
       * ) => boolean}
       */
      has(key) {
        return hasWeakMap(
          getWeakMapStrict(
            weak_map_registery,
            enterValue(region, this),
            TypeError,
          ),
          enterValue(region, key),
        );
      },
      /**
       * @type {(
       *   this: import("./domain").ExternalValue,
       *   key: import("./domain").ExternalValue,
       * ) => import("./domain").ExternalValue}
       */
      get(key) {
        const result = getWeakMap(
          getWeakMapStrict(
            weak_map_registery,
            enterValue(region, this),
            TypeError,
          ),
          enterValue(region, key),
        );
        return result == null ? undefined : leaveValue(region, result);
      },
      /**
       * @type {(
       *   this: import("./domain").ExternalValue,
       *   key: import("./domain").ExternalValue,
       *   val: import("./domain").ExternalValue,
       * ) => import("./domain").ExternalValue}
       */
      set(key, val) {
        setWeakMap(
          getWeakMapStrict(
            weak_map_registery,
            enterValue(region, this),
            TypeError,
          ),
          enterValue(region, key),
          enterValue(region, val),
        );
        return this;
      },
      /**
       * @type {(
       *   this: import("./domain").ExternalValue,
       *   key: import("./domain").ExternalValue,
       * ) => boolean}
       */
      delete(key) {
        return deleteWeakMap(
          getWeakMapStrict(
            weak_map_registery,
            enterValue(region, this),
            TypeError,
          ),
          enterValue(region, key),
        );
      },
    },
    writable: false,
    enumerable: false,
    configurable: false,
  };
  defineProperty(constructor, "prototype", prototype_descriptor);
  return /** @type {any} */ (constructor);
};

/**
 * @type {(
 *   region: import("./region/region").Region,
 * ) => import("./domain").ExternalReference}
 */
const compileMap = (region) => {
  const {
    map_registery,
    "global.Object.create": createObject,
    "global.Object.prototype": object_prototype,
    "global.TypeError": TypeError,
    "global.undefined": undefined,
  } = region;
  /**
   * @type {(
   *   entries?: null | undefined | [
   *     import("./domain").ExternalValue,
   *     import("./domain").ExternalValue,
   *   ][],
   * ) => import("./domain").PlainInternalObject}
   */
  const constructor = function LinvailMap(...input) {
    /** @type {undefined | import("./domain").ExternalReference} */
    const external_new_target = /** @type {any} */ (new.target);
    if (!external_new_target) {
      throw new TypeError("LinvailMap is a constructor");
    }
    const internal_new_target = enterReference(region, external_new_target);
    const result = createObject(
      toMaybeInternalReferenceStrict(
        region,
        getInternalPropertyValue(
          region,
          internal_new_target,
          "prototype",
          internal_new_target,
        ),
      ),
    );
    setWeakMap(
      map_registery,
      result,
      createMap(
        map(
          input.length === 0 ? [] : (input[0] ?? []),
          ({ 0: key, 1: val }) => [
            enterValue(region, key),
            enterValue(region, val),
          ],
        ),
      ),
    );
    return result;
  };
  const prototype_descriptor = {
    __proto__: null,
    value: {
      __proto__: object_prototype,
      constructor,
      /**
       * @type {(
       *   this: import("./domain").ExternalValue,
       *   key: import("./domain").ExternalValue,
       * ) => boolean}
       */
      has(key) {
        return hasMap(
          getWeakMapStrict(map_registery, enterValue(region, this), TypeError),
          enterValue(region, key),
        );
      },
      /**
       * @type {(
       *   this: import("./domain").ExternalValue,
       *   key: import("./domain").ExternalValue,
       * ) => import("./domain").ExternalValue}
       */
      get(key) {
        const result = getMap(
          getWeakMapStrict(map_registery, enterValue(region, this), TypeError),
          enterValue(region, key),
        );
        return result == null ? undefined : leaveValue(region, result);
      },
      /**
       * @type {(
       *   this: import("./domain").ExternalValue,
       *   key: import("./domain").ExternalValue,
       *   val: import("./domain").ExternalValue,
       * ) => import("./domain").ExternalValue}
       */
      set(key, val) {
        setMap(
          getWeakMapStrict(map_registery, enterValue(region, this), TypeError),
          enterValue(region, key),
          enterValue(region, val),
        );
        return this;
      },
      /**
       * @type {(
       *   this: import("./domain").ExternalValue,
       *   key: import("./domain").ExternalValue,
       * ) => boolean}
       */
      delete(key) {
        return deleteMap(
          getWeakMapStrict(map_registery, enterValue(region, this), TypeError),
          enterValue(region, key),
        );
      },
      /**
       * @type {(
       *   this: import("./domain").ExternalValue,
       * ) => void}
       */
      clear() {
        clearMap(
          getWeakMapStrict(map_registery, enterValue(region, this), TypeError),
        );
      },
      /**
       * @type {(
       *   this: import("./domain").ExternalValue,
       * ) => number}
       */
      getSize() {
        return getMapSize(
          getWeakMapStrict(map_registery, enterValue(region, this), TypeError),
        );
      },
      /**
       * @type {(
       *   this: import("./domain").ExternalValue,
       *   callback: import("./domain").ExternalValue,
       *   this_arg: import("./domain").ExternalValue,
       * ) => void}
       */
      forEach(callback, this_arg) {
        if (typeof callback !== "function") {
          throw new TypeError("Invalid callback");
        }
        const internal_callback = enterReference(region, callback);
        const internal_this_arg = enterValue(region, this_arg);
        const internal_this = enterValue(region, this);
        forEachMap(
          getWeakMapStrict(map_registery, internal_this, TypeError),
          (key, val) => {
            applyInternal(region, internal_callback, internal_this_arg, [
              key,
              val,
              internal_this,
            ]);
          },
          null,
        );
      },
    },
    writable: false,
    enumerable: false,
    configurable: false,
  };
  defineProperty(constructor, "prototype", prototype_descriptor);
  return /** @type {any} */ (constructor);
};

/**
 * @type {(
 *   region: import("./region/region").Region,
 * ) => import("./domain").ExternalReference}
 */
export const createLibrary = (region) => {
  const {
    "global.Object.create": createObject,
    "global.Reflect.defineProperty": defineProperty,
    "global.Object.prototype": object_prototype,
  } = region;
  const library = createObject(object_prototype);
  defineProperty(library, "dir", {
    __proto__: null,
    value: compileDir(region),
    writable: true,
    enumerable: false,
    configurable: true,
  });
  defineProperty(library, "is", {
    __proto__: null,
    value: compileIs(region),
    writable: true,
    enumerable: false,
    configurable: true,
  });
  defineProperty(library, "addEventListener", {
    __proto__: null,
    value: compileAddEventListener(region),
    writable: true,
    enumerable: false,
    configurable: true,
  });
  defineProperty(library, "removeEventListener", {
    __proto__: null,
    value: compileRemoveEventListener(region),
    writable: true,
    enumerable: false,
    configurable: true,
  });
  defineProperty(library, "WeakSet", {
    __proto__: null,
    value: compileWeakSet(region),
    writable: true,
    enumerable: false,
    configurable: true,
  });
  defineProperty(library, "Set", {
    __proto__: null,
    value: compileSet(region),
    writable: true,
    enumerable: false,
    configurable: true,
  });
  defineProperty(library, "WeakMap", {
    __proto__: null,
    value: compileWeakMap(region),
    writable: true,
    enumerable: false,
    configurable: true,
  });
  defineProperty(library, "Map", {
    __proto__: null,
    value: compileMap(region),
    writable: true,
    enumerable: false,
    configurable: true,
  });
  return library;
};
