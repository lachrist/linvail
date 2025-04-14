import { map } from "../util/array.mjs";
import {
  createSafeSet,
  createSafeWeakMap,
  createSafeWeakSet,
  createSafeMap,
} from "../util/collection.mjs";
import { toPrototype } from "../runtime/oracle/helper.mjs";
import {
  applyInternal,
  getInternalPropertyValue,
} from "../runtime/reflect.mjs";
import {
  wrapReference,
  wrapValue,
  createEmptyObject,
} from "../runtime/region/wrap.mjs";
import { isStandardPrimitive } from "../runtime/domain.mjs";

/**
 * @type {<K extends object, V extends object>(
 *   weakmap: import("../util/collection.d.ts").SafeWeakMap<K, V>,
 *   key: K,
 *   Error: new (message: string) => Error,
 * ) => V}
 */
const getWeakMapStrict = (weakmap, key, Error) => {
  const result = weakmap.$get(key);
  if (!result) {
    throw new Error("Incompatible receiver");
  }
  return result;
};

/**
 * @type {(
 *   region: import("../runtime/region.d.ts").Region,
 * ) => any}
 */
const compileIs = (_region) => {
  /**
   * @type {(
   *   value1: import("../runtime/domain.d.ts").Value,
   *   value2: import("../runtime/domain.d.ts").Value,
   * ) => boolean}
   */
  const is = (value1, value2) =>
    isStandardPrimitive(value1) || isStandardPrimitive(value2)
      ? false
      : value1 === value2;
  return is;
};

/**
 * @type {(
 *   region: import("../runtime/region.d.ts").Region,
 * ) => any}
 */
const compileDir = (region) => {
  const { dir: dirInner } = region;
  /**
   * @type {(
   *   value: import("../runtime/domain.d.ts").Value,
   * ) => void}
   */
  const dir = (value) => {
    dirInner(wrapValue(region, value));
  };
  return dir;
};

/**
 * @type {(
 *   region: import("../runtime/region.d.ts").Region,
 * ) => any}
 */
const compileWeakSet = (region) => {
  const {
    weak_set_registery,
    "global.Reflect.defineProperty": defineProperty,
    "global.Object.prototype": object_prototype,
    "global.TypeError": TypeError,
  } = region;
  /**
   * @type {(
   *   keys?: null | undefined | import("../runtime/domain.d.ts").Value[],
   * ) => import("../runtime/domain.d.ts").ProxyReference}
   */
  const constructor = function LinvailWeakSet(...input) {
    /** @type {undefined | import("../runtime/domain.d.ts").Reference} */
    const external_new_target = /** @type {any} */ (new.target);
    if (!external_new_target) {
      throw new TypeError("LinvailWeakSet is a constructor");
    }
    const internal_new_target = wrapReference(region, external_new_target);
    const result = createEmptyObject(
      region,
      toPrototype(
        region,
        getInternalPropertyValue(
          region,
          internal_new_target,
          "prototype",
          internal_new_target,
        ),
      ),
    );
    weak_set_registery.$set(
      result,
      createSafeWeakSet(
        map(input.length === 0 ? [] : (input[0] ?? []), (key) =>
          wrapValue(region, key),
        ),
      ),
    );
    return result.inner;
  };
  const prototype = {
    __proto__: object_prototype,
    constructor,
    /**
     * @type {(
     *   this: import("../runtime/domain.d.ts").Value,
     *   key: import("../runtime/domain.d.ts").Value,
     * ) => boolean}
     */
    has(key) {
      return getWeakMapStrict(
        weak_set_registery,
        wrapValue(region, this),
        TypeError,
      ).$has(wrapValue(region, key));
    },
    /**
     * @type {(
     *   this: import("../runtime/domain.d.ts").Value,
     *   key: import("../runtime/domain.d.ts").Value,
     *   val: import("../runtime/domain.d.ts").Value,
     * ) => import("../runtime/domain.d.ts").Value}
     */
    add(key) {
      getWeakMapStrict(
        weak_set_registery,
        wrapValue(region, this),
        TypeError,
      ).$add(wrapValue(region, key));
      return this;
    },
    /**
     * @type {(
     *   this: import("../runtime/domain.d.ts").Value,
     *   key: import("../runtime/domain.d.ts").Value,
     * ) => boolean}
     */
    delete(key) {
      return getWeakMapStrict(
        weak_set_registery,
        wrapValue(region, this),
        TypeError,
      ).$delete(wrapValue(region, key));
    },
  };
  defineProperty(
    /** @type {import("../runtime/domain.d.ts").GuestReference} */ (
      /** @type {unknown} */ (constructor)
    ),
    "prototype",
    {
      __proto__: null,
      value: /** @type {import("../runtime/domain.d.ts").GuestReference} */ (
        /** @type {unknown} */ (prototype)
      ),
      writable: false,
      enumerable: false,
      configurable: false,
    },
  );
  return constructor;
};

/**
 * @type {(
 *   region: import("../runtime/region.d.ts").Region,
 * ) => any}
 */
const compileSet = (region) => {
  const {
    set_registery,
    "global.undefined": undefined,
    "global.Reflect.defineProperty": defineProperty,
    "global.Object.prototype": object_prototype,
    "global.TypeError": TypeError,
  } = region;
  /**
   * @type {(
   *   keys?: null | undefined | import("../runtime/domain.d.ts").Value[],
   * ) => import("../runtime/domain.d.ts").ProxyReference}
   */
  const constructor = function LinvailSet(...input) {
    /** @type {undefined | import("../runtime/domain.d.ts").Reference} */
    const external_new_target = /** @type {any} */ (new.target);
    if (!external_new_target) {
      throw new TypeError("LinvailSet is a constructor");
    }
    const internal_new_target = wrapReference(region, external_new_target);
    const result = createEmptyObject(
      region,
      toPrototype(
        region,
        getInternalPropertyValue(
          region,
          internal_new_target,
          "prototype",
          internal_new_target,
        ),
      ),
    );
    set_registery.$set(
      result,
      createSafeSet(
        map(input.length === 0 ? [] : (input[0] ?? []), (key) =>
          wrapValue(region, key),
        ),
      ),
    );
    return result.inner;
  };
  const prototype = {
    __proto__: object_prototype,
    constructor,
    /**
     * @type {(
     *   this: import("../runtime/domain.d.ts").Value,
     *   key: import("../runtime/domain.d.ts").Value,
     * ) => boolean}
     */
    has(key) {
      return getWeakMapStrict(
        set_registery,
        wrapValue(region, this),
        TypeError,
      ).$has(wrapValue(region, key));
    },
    /**
     * @type {(
     *   this: import("../runtime/domain.d.ts").Value,
     *   key: import("../runtime/domain.d.ts").Value,
     *   val: import("../runtime/domain.d.ts").Value,
     * ) => import("../runtime/domain.d.ts").Value}
     */
    add(key) {
      getWeakMapStrict(set_registery, wrapValue(region, this), TypeError).$add(
        wrapValue(region, key),
      );
      return this;
    },
    /**
     * @type {(
     *   this: import("../runtime/domain.d.ts").Value,
     *   key: import("../runtime/domain.d.ts").Value,
     * ) => boolean}
     */
    delete(key) {
      return getWeakMapStrict(
        set_registery,
        wrapValue(region, this),
        TypeError,
      ).$delete(wrapValue(region, key));
    },
    /**
     * @type {(
     *   this: import("../runtime/domain.d.ts").Value,
     * ) => void}
     */
    clear() {
      getWeakMapStrict(
        set_registery,
        wrapValue(region, this),
        TypeError,
      ).$clear();
    },
    /**
     * @type {(
     *   this: import("../runtime/domain.d.ts").Value,
     * ) => number}
     */
    getSize() {
      return getWeakMapStrict(
        set_registery,
        wrapValue(region, this),
        TypeError,
      ).$getSize();
    },
    /**
     * @type {(
     *   this: import("../runtime/domain.d.ts").Value,
     *   callback: import("../runtime/domain.d.ts").Value,
     *   this_arg?: import("../runtime/domain.d.ts").Value,
     * ) => void}
     */
    forEach(callback, ...rest) {
      const this_arg = rest.length === 0 ? undefined : rest[0];
      if (typeof callback !== "function") {
        throw new TypeError("Invalid callback");
      }
      const internal_callback = wrapReference(region, callback);
      const internal_this_arg = wrapValue(region, this_arg);
      const internal_this = wrapValue(region, this);
      getWeakMapStrict(set_registery, internal_this, TypeError).$forEach(
        (key, val) => {
          applyInternal(region, internal_callback, internal_this_arg, [
            key,
            val,
            internal_this,
          ]);
        },
      );
    },
  };
  defineProperty(
    /** @type {import("../runtime/domain.d.ts").GuestReference} */ (
      /** @type {unknown} */ (constructor)
    ),
    "prototype",
    {
      __proto__: null,
      value: /** @type {import("../runtime/domain.d.ts").GuestReference} */ (
        /** @type {unknown} */ (prototype)
      ),
      writable: false,
      enumerable: false,
      configurable: false,
    },
  );
  return constructor;
};

/**
 * @type {(
 *   region: import("../runtime/region.d.ts").Region,
 * ) => any}
 */
const compileWeakMap = (region) => {
  const {
    weak_map_registery,
    "global.Reflect.defineProperty": defineProperty,
    "global.Object.prototype": object_prototype,
    "global.TypeError": TypeError,
    "global.undefined": undefined,
  } = region;
  /**
   * @type {(
   *   entries?: null | undefined | [
   *     import("../runtime/domain.d.ts").Value,
   *     import("../runtime/domain.d.ts").Value,
   *   ][],
   * ) => import("../runtime/domain.d.ts").ProxyReference}
   */
  const constructor = function LinvailWeakMap(...input) {
    /** @type {undefined | import("../runtime/domain.d.ts").Reference} */
    const external_new_target = /** @type {any} */ (new.target);
    if (!external_new_target) {
      throw new TypeError("LinvailWeakMap is a constructor");
    }
    const internal_new_target = wrapReference(region, external_new_target);
    const result = createEmptyObject(
      region,
      toPrototype(
        region,
        getInternalPropertyValue(
          region,
          internal_new_target,
          "prototype",
          internal_new_target,
        ),
      ),
    );
    weak_map_registery.$set(
      result,
      createSafeWeakMap(
        map(
          input.length === 0 ? [] : (input[0] ?? []),
          ({ 0: key, 1: val }) => [
            wrapValue(region, key),
            wrapValue(region, val),
          ],
        ),
      ),
    );
    return result.inner;
  };
  const prototype = {
    __proto__: object_prototype,
    constructor,
    /**
     * @type {(
     *   this: import("../runtime/domain.d.ts").Value,
     *   key: import("../runtime/domain.d.ts").Value,
     * ) => boolean}
     */
    has(key) {
      return getWeakMapStrict(
        weak_map_registery,
        wrapValue(region, this),
        TypeError,
      ).$has(wrapValue(region, key));
    },
    /**
     * @type {(
     *   this: import("../runtime/domain.d.ts").Value,
     *   key: import("../runtime/domain.d.ts").Value,
     * ) => import("../runtime/domain.d.ts").Value}
     */
    get(key) {
      const result = getWeakMapStrict(
        weak_map_registery,
        wrapValue(region, this),
        TypeError,
      ).$get(wrapValue(region, key));
      return result == null ? undefined : result.inner;
    },
    /**
     * @type {(
     *   this: import("../runtime/domain.d.ts").Value,
     *   key: import("../runtime/domain.d.ts").Value,
     *   val: import("../runtime/domain.d.ts").Value,
     * ) => import("../runtime/domain.d.ts").Value}
     */
    set(key, val) {
      getWeakMapStrict(
        weak_map_registery,
        wrapValue(region, this),
        TypeError,
      ).$set(wrapValue(region, key), wrapValue(region, val));
      return this;
    },
    /**
     * @type {(
     *   this: import("../runtime/domain.d.ts").Value,
     *   key: import("../runtime/domain.d.ts").Value,
     * ) => boolean}
     */
    delete(key) {
      return getWeakMapStrict(
        weak_map_registery,
        wrapValue(region, this),
        TypeError,
      ).$delete(wrapValue(region, key));
    },
  };
  defineProperty(
    /** @type {import("../runtime/domain.d.ts").GuestReference} */ (
      /** @type {unknown} */ (constructor)
    ),
    "prototype",
    {
      __proto__: null,
      value: /** @type {import("../runtime/domain.d.ts").GuestReference} */ (
        /** @type {unknown} */ (prototype)
      ),
      writable: false,
      enumerable: false,
      configurable: false,
    },
  );
  return constructor;
};

/**
 * @type {(
 *   region: import("../runtime/region.d.ts").Region,
 * ) => any}
 */
const compileMap = (region) => {
  const {
    map_registery,
    "global.Reflect.defineProperty": defineProperty,
    "global.Object.prototype": object_prototype,
    "global.TypeError": TypeError,
    "global.undefined": undefined,
  } = region;
  /**
   * @type {(
   *   entries?: null | undefined | [
   *     import("../runtime/domain.d.ts").Value,
   *     import("../runtime/domain.d.ts").Value,
   *   ][],
   * ) => import("../runtime/domain.d.ts").ProxyReference}
   */
  const constructor = function LinvailMap(...input) {
    /** @type {undefined | import("../runtime/domain.d.ts").Reference} */
    const external_new_target = /** @type {any} */ (new.target);
    if (!external_new_target) {
      throw new TypeError("LinvailMap is a constructor");
    }
    const internal_new_target = wrapReference(region, external_new_target);
    const result = createEmptyObject(
      region,
      toPrototype(
        region,
        getInternalPropertyValue(
          region,
          internal_new_target,
          "prototype",
          internal_new_target,
        ),
      ),
    );
    map_registery.$set(
      result,
      createSafeMap(
        map(
          input.length === 0 ? [] : (input[0] ?? []),
          ({ 0: key, 1: val }) => [
            wrapValue(region, key),
            wrapValue(region, val),
          ],
        ),
      ),
    );
    return result.inner;
  };
  const prototype = {
    __proto__: object_prototype,
    constructor,
    /**
     * @type {(
     *   this: import("../runtime/domain.d.ts").Value,
     *   key: import("../runtime/domain.d.ts").Value,
     * ) => boolean}
     */
    has(key) {
      return getWeakMapStrict(
        map_registery,
        wrapValue(region, this),
        TypeError,
      ).$has(wrapValue(region, key));
    },
    /**
     * @type {(
     *   this: import("../runtime/domain.d.ts").Value,
     *   key: import("../runtime/domain.d.ts").Value,
     * ) => import("../runtime/domain.d.ts").Value}
     */
    get(key) {
      const result = getWeakMapStrict(
        map_registery,
        wrapValue(region, this),
        TypeError,
      ).$get(wrapValue(region, key));
      return result == null ? undefined : result.inner;
    },
    /**
     * @type {(
     *   this: import("../runtime/domain.d.ts").Value,
     *   key: import("../runtime/domain.d.ts").Value,
     *   val: import("../runtime/domain.d.ts").Value,
     * ) => import("../runtime/domain.d.ts").Value}
     */
    set(key, val) {
      getWeakMapStrict(map_registery, wrapValue(region, this), TypeError).$set(
        wrapValue(region, key),
        wrapValue(region, val),
      );
      return this;
    },
    /**
     * @type {(
     *   this: import("../runtime/domain.d.ts").Value,
     *   key: import("../runtime/domain.d.ts").Value,
     * ) => boolean}
     */
    delete(key) {
      return getWeakMapStrict(
        map_registery,
        wrapValue(region, this),
        TypeError,
      ).$delete(wrapValue(region, key));
    },
    /**
     * @type {(
     *   this: import("../runtime/domain.d.ts").Value,
     * ) => void}
     */
    clear() {
      getWeakMapStrict(
        map_registery,
        wrapValue(region, this),
        TypeError,
      ).$clear();
    },
    /**
     * @type {(
     *   this: import("../runtime/domain.d.ts").Value,
     * ) => number}
     */
    getSize() {
      return getWeakMapStrict(
        map_registery,
        wrapValue(region, this),
        TypeError,
      ).$getSize();
    },
    /**
     * @type {(
     *   this: import("../runtime/domain.d.ts").Value,
     *   callback: import("../runtime/domain.d.ts").Value,
     *   this_arg?: import("../runtime/domain.d.ts").Value,
     * ) => void}
     */
    forEach(callback, ...rest) {
      const this_arg = rest.length === 0 ? undefined : rest[0];
      if (typeof callback !== "function") {
        throw new TypeError("Invalid callback");
      }
      const internal_callback = wrapReference(region, callback);
      const internal_this_arg = wrapValue(region, this_arg);
      const internal_this = wrapValue(region, this);
      getWeakMapStrict(map_registery, internal_this, TypeError).$forEach(
        (val, key) => {
          applyInternal(region, internal_callback, internal_this_arg, [
            val,
            key,
            internal_this,
          ]);
        },
      );
    },
  };
  defineProperty(
    /** @type {import("../runtime/domain.d.ts").GuestReference} */ (
      /** @type {unknown} */ (constructor)
    ),
    "prototype",
    {
      __proto__: null,
      value: /** @type {import("../runtime/domain.d.ts").GuestReference} */ (
        /** @type {unknown} */ (prototype)
      ),
      writable: false,
      enumerable: false,
      configurable: false,
    },
  );
  return constructor;
};

/**
 * @type {(
 *   region: import("../runtime/region.d.ts").Region,
 * ) => import("./library.d.ts").Library}
 */
export const createLibrary = (region) => ({
  // @ts-ignore
  __proto__: region["global.Object.prototype"],
  dir: compileDir(region),
  is: compileIs(region),
  WeakSet: compileWeakSet(region),
  Set: compileSet(region),
  WeakMap: compileWeakMap(region),
  Map: compileMap(region),
});
