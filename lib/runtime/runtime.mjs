const {
  Reflect: { construct, apply, getOwnPropertyDescriptor },
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
    prototype: {
      get: getMap,
      has: hasMap,
      set: setMap,
      delete: deleteMap,
      clear: clearMap,
    },
  },
  Set,
  Set: {
    prototype: { has: hasSet, add: addSet, delete: deleteSet, clear: clearSet },
  },
  WeakSet,
  WeakSet: {
    prototype: { has: hasWeakSet, add: addWeakSet, delete: deleteWeakSet },
  },
} = globalThis;

export const runtime = {};

/**
 * @type {(
 *   intrinsics: import("./intrinsic").IntrinsicRecord,
 * ) => import("./runtime").Runtime}
 */
export const createRuntime = (intrinsics) => {
  /** @type {<X>(x1: X, x2: X) => boolean} */
  const same = (x1, x2) => x1 === x2;
  /////////////
  // WeakSet //
  /////////////
  /** @type {new <X>() => import("./runtime").LinvailWeakSet<X>} */
  const LinvailWeakSet = /** @type {any} */ (
    function () {
      return construct(WeakSet, [], new.target);
    }
  );
  /** @type {import("./runtime").LinvailWeakSetPrototype} */
  const LinvailWeakSetPrototype = {
    __proto__: intrinsics["Object.prototype"],
    add: function (value) {
      return apply(addWeakSet, this, [value]);
    },
    has: function (value) {
      return apply(hasWeakSet, this, [value]);
    },
    delete: function (value) {
      return apply(deleteWeakSet, this, [value]);
    },
  };
  /////////////
  // WeakMap //
  /////////////
  /** @type {new <X>() => import("./runtime").LinvailWeakMap<X>} */
  const LinvailWeakMap = /** @type {any} */ (
    function () {
      return construct(WeakMap, [], new.target);
    }
  );
  /** @type {import("./runtime").LinvailWeakMapPrototype} */
  const LinvailWeakMapPrototype = {
    __proto__: intrinsics["Object.prototype"],
    get: function (key) {
      return apply(getWeakMap, this, [key]);
    },
    set: function (key, value) {
      return apply(setWeakMap, this, [key, value]);
    },
    has: function (key) {
      return apply(hasWeakMap, this, [key]);
    },
    delete: function (key) {
      return apply(deleteWeakMap, this, [key]);
    },
  };
  /////////
  // Map //
  /////////
  /** @type {new <X>() => import("./runtime").LinvailMap<X>} */
  const LinvailMap = /** @type {any} */ (
    function () {
      return construct(Map, [], new.target);
    }
  );
  /** @type {import("./runtime").LinvailMapPrototype} */
  const LinvailMapPrototype = {
    __proto__: intrinsics["Object.prototype"],
    has: function (key) {
      return apply(hasMap, this, [key]);
    },
    get: function (key) {
      return apply(getMap, this, [key]);
    },
    set: function (key, value) {
      return apply(setMap, this, [key, value]);
    },
    delete: function (key) {
      return apply(deleteMap, this, [key]);
    },
    clear: function () {
      return apply(clearMap, this, []);
    },
    forEach: function (callback, thisArg) {
      return apply(Map.prototype.forEach, this, [callback, thisArg]);
    },
  };
  /////////
  // Set //
  /////////
  /** @type {new <X>() => import("./runtime").LinvailSet<X>} */
  const LinvailSet = /** @type {any} */ (
    function () {
      return construct(Set, [], new.target);
    }
  );
  /** @type {import("./runtime").LinvailSetPrototype} */
  const LinvailSetPrototype = {
    __proto__: intrinsics["Object.prototype"],
    has: function (key) {
      return apply(hasSet, this, [key]);
    },
    add: function (key) {
      return apply(addSet, this, [key]);
    },
    delete: function (key) {
      return apply(deleteSet, this, [key]);
    },
    clear: function () {
      return apply(clearSet, this, []);
    },
    forEach: function (callback, thisArg) {
      return apply(Map.prototype.forEach, this, [callback, thisArg]);
    },
  };
  /////////////
  // Runtime //
  /////////////
  LinvailWeakSet.prototype = LinvailWeakSetPrototype;
  LinvailWeakMap.prototype = LinvailWeakMapPrototype;
  LinvailMap.prototype = LinvailMap;
  LinvailSet.prototype = LinvailSetPrototype;
  return {
    same,
    WeakSet: LinvailWeakSet,
    WeakMap: LinvailWeakMap,
    Map: LinvailMap,
    Set: LinvailSet,
  };
};

/**
 * @type {(
 *   runtime: import("./runtime").Runtime,
 * ) => import("./runtime").LinvailIntrinsicRecord}
 */
export const toIntrinsicRecord = (runtime) => ({
  "Linvail.same": runtime.same,
  "Linvail.WeakSet": runtime.WeakSet,
  "Linvail.WeakSet.prototype.add": runtime.WeakSet.prototype.add,
  "Linvail.WeakSet.prototype.has": runtime.WeakSet.prototype.has,
  "Linvail.WeakSet.prototype.delete": runtime.WeakSet.prototype.delete,
  "Linvail.WeakMap": runtime.WeakMap,
  "Linvail.WeakMap.prototype.get": runtime.WeakMap.prototype.get,
  "Linvail.WeakMap.prototype.set": runtime.WeakMap.prototype.set,
  "Linvail.WeakMap.prototype.has": runtime.WeakMap.prototype.has,
  "Linvail.WeakMap.prototype.delete": runtime.WeakMap.prototype.delete,
  "Linvail.Map": runtime.Map,
  "Linvail.Map.prototype.has": runtime.Map.prototype.has,
  "Linvail.Map.prototype.get": runtime.Map.prototype.get,
  "Linvail.Map.prototype.set": runtime.Map.prototype.set,
  "Linvail.Map.prototype.delete": runtime.Map.prototype.delete,
  "Linvail.Map.prototype.clear": runtime.Map.prototype.clear,
  "Linvail.Map.prototype.forEach": runtime.Map.prototype.forEach,
  "Linvail.Set": runtime.Set,
  "Linvail.Set.prototype.has": runtime.Set.prototype.has,
  "Linvail.Set.prototype.add": runtime.Set.prototype.add,
  "Linvail.Set.prototype.delete": runtime.Set.prototype.delete,
  "Linvail.Set.prototype.clear": runtime.Set.prototype.clear,
  "Linvail.Set.prototype.forEach": runtime.Set.prototype.forEach,
});
