import * as Linvail from "../linvail.mjs";

const { Error, Reflect, undefined } = globalThis;

Error.stackTraceLimit = 1 / 0;

/**
 * @type {(
 *   actual: unknown,
 *   expect: unknown,
 * ) => void}
 */
const assertEqual = (actual, expect) => {
  if (actual !== expect) {
    throw new Error("assertion failure", { cause: { actual, expect } });
  }
};

/**
 * @type {(
 *   closure: () => void,
 *   name: string,
 * ) => void}
 */
const assertThrow = (closure, name) => {
  try {
    closure();
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "name" in error &&
      error.name === name
    ) {
      return undefined;
    }
  }
  throw new Error("missing exception", { cause: { name } });
};

/**
 * @type {(
 *   actual: function,
 *   options: {
 *     name: string,
 *     length: number,
 *   },
 * ) => void}
 */
const assertClosure = (actual, { name, length }) => {
  assertEqual(typeof actual, "function");
  assertEqual(actual.length, length);
  assertEqual(actual.name, name);
};

// dir //
assertClosure(Linvail.dir, { name: "dir", length: 1 });
assertEqual(Linvail.dir(123), undefined);

// is //
assertClosure(Linvail.is, { name: "is", length: 2 });
assertEqual(Linvail.is(123, 123), false);
{
  const x = 123;
  assertEqual(Linvail.is(x, x), true);
}

// WeakSet //
{
  const k1 = 123;
  const k2 = 123;
  assertClosure(Linvail.WeakSet, {
    name: "LinvailWeakSet",
    length: 0,
  });
  assertEqual(Linvail.WeakSet.prototype.constructor, Linvail.WeakSet);
  assertClosure(Linvail.WeakSet.prototype.has, {
    name: "has",
    length: 1,
  });
  assertClosure(Linvail.WeakSet.prototype.add, {
    name: "add",
    length: 1,
  });
  assertClosure(Linvail.WeakSet.prototype.delete, {
    name: "delete",
    length: 1,
  });
  assertThrow(() => {
    /** @type {any} */ (Linvail.WeakSet)([]);
  }, "TypeError");
  /**
   * @type {import("./library").LinvailWeakSet<number>}
   */
  const set = new Linvail.WeakSet();
  assertEqual(Reflect.getPrototypeOf(set), Linvail.WeakSet.prototype);
  assertEqual(set.delete(k1), false);
  assertEqual(set.has(k1), false);
  assertEqual(set.add(k1), set);
  assertEqual(set.has(k1), true);
  assertEqual(set.has(k2), false);
  assertEqual(set.delete(k2), false);
  assertEqual(set.delete(k1), true);
  assertEqual(set.has(k1), false);
}

// WeakMap //
{
  const k1 = 123;
  const v1 = "foo";
  const k2 = 123;
  assertClosure(Linvail.WeakMap, {
    name: "LinvailWeakMap",
    length: 0,
  });
  assertEqual(Linvail.WeakMap.prototype.constructor, Linvail.WeakMap);
  assertClosure(Linvail.WeakMap.prototype.has, {
    name: "has",
    length: 1,
  });
  assertClosure(Linvail.WeakMap.prototype.get, {
    name: "get",
    length: 1,
  });
  assertClosure(Linvail.WeakMap.prototype.set, {
    name: "set",
    length: 2,
  });
  assertClosure(Linvail.WeakMap.prototype.delete, {
    name: "delete",
    length: 1,
  });
  assertThrow(() => {
    /** @type {any} */ (Linvail.WeakMap)([]);
  }, "TypeError");
  /**
   * @type {import("./library").LinvailWeakMap<number, string>}
   */
  const map = new Linvail.WeakMap();
  assertEqual(Reflect.getPrototypeOf(map), Linvail.WeakMap.prototype);
  assertEqual(map.delete(k1), false);
  assertEqual(map.has(k1), false);
  assertEqual(map.set(k1, v1), map);
  assertEqual(map.has(k1), true);
  assertEqual(map.get(k1), v1);
  assertEqual(map.get(k2), undefined);
  assertEqual(map.has(k2), false);
  assertEqual(map.delete(k2), false);
  assertEqual(map.delete(k1), true);
  assertEqual(map.has(k1), false);
}

// Set //
{
  const k1 = 123;
  const k2 = 123;
  assertClosure(Linvail.Set, {
    name: "LinvailSet",
    length: 0,
  });
  assertEqual(Linvail.Set.prototype.constructor, Linvail.Set);
  assertClosure(Linvail.Set.prototype.has, {
    name: "has",
    length: 1,
  });
  assertClosure(Linvail.Set.prototype.add, {
    name: "add",
    length: 1,
  });
  assertClosure(Linvail.Set.prototype.delete, {
    name: "delete",
    length: 1,
  });
  assertClosure(Linvail.Set.prototype.clear, {
    name: "clear",
    length: 0,
  });
  assertClosure(Linvail.Set.prototype.getSize, {
    name: "getSize",
    length: 0,
  });
  assertClosure(Linvail.Set.prototype.forEach, {
    name: "forEach",
    length: 1,
  });
  assertThrow(() => {
    /** @type {any} */ (Linvail.Set)([]);
  }, "TypeError");
  /**
   * @type {import("./library").LinvailSet<number>}
   */
  const set = new Linvail.Set();
  assertEqual(Reflect.getPrototypeOf(set), Linvail.Set.prototype);
  assertEqual(set.delete(k1), false);
  assertEqual(set.has(k1), false);
  assertEqual(set.getSize(), 0);
  assertEqual(set.add(k1), set);
  assertEqual(set.getSize(), 1);
  assertEqual(set.has(k1), true);
  assertEqual(set.has(k2), false);
  assertEqual(set.delete(k1), true);
  assertEqual(set.has(k1), false);
  assertEqual(set.add(k1), set);
  assertEqual(set.add(k2), set);
  assertEqual(set.getSize(), 2);
  assertThrow(() => {
    set.forEach(/** @type {any} */ (null), null);
  }, "TypeError");
  {
    /**
     * @type {(
     *   & { __proto__: null, length: number }
     *   & { [k in number]: unknown }
     * )}
     */
    const keys = { __proto__: null, length: 0 };
    set.forEach(function (...args) {
      assertEqual(this, 123);
      assertEqual(args.length, 3);
      assertEqual(Linvail.is(args[0], args[1]), true);
      assertEqual(args[2], set);
      keys[keys.length++] = args[0];
    }, 123);
    assertEqual(keys.length, 2);
    assertEqual(Linvail.is(keys[0], k1), true);
    assertEqual(Linvail.is(keys[1], k2), true);
  }
  assertEqual(set.clear(), undefined);
  assertEqual(set.getSize(), 0);
}

// Map //
{
  const k1 = 123;
  const v1 = "foo";
  const k2 = 123;
  const v2 = "bar";
  assertClosure(Linvail.Map, {
    name: "LinvailMap",
    length: 0,
  });
  assertEqual(Linvail.Map.prototype.constructor, Linvail.Map);
  assertClosure(Linvail.Map.prototype.has, {
    name: "has",
    length: 1,
  });
  assertClosure(Linvail.Map.prototype.get, {
    name: "get",
    length: 1,
  });
  assertClosure(Linvail.Map.prototype.set, {
    name: "set",
    length: 2,
  });
  assertClosure(Linvail.Map.prototype.delete, {
    name: "delete",
    length: 1,
  });
  assertClosure(Linvail.Map.prototype.clear, {
    name: "clear",
    length: 0,
  });
  assertClosure(Linvail.Map.prototype.getSize, {
    name: "getSize",
    length: 0,
  });
  assertClosure(Linvail.Map.prototype.forEach, {
    name: "forEach",
    length: 1,
  });
  assertThrow(() => {
    /** @type {any} */ (Linvail.Map)([]);
  }, "TypeError");
  /**
   * @type {import("./library").LinvailMap<number, string>}
   */
  const map = new Linvail.Map();
  assertEqual(Reflect.getPrototypeOf(map), Linvail.Map.prototype);
  assertEqual(map.delete(k1), false);
  assertEqual(map.has(k1), false);
  assertEqual(map.getSize(), 0);
  assertEqual(map.set(k1, v1), map);
  assertEqual(map.getSize(), 1);
  assertEqual(map.has(k1), true);
  assertEqual(map.has(k2), false);
  assertEqual(map.delete(k1), true);
  assertEqual(map.has(k1), false);
  assertEqual(map.set(k1, v1), map);
  assertEqual(map.set(k2, v2), map);
  assertEqual(map.get(k1), v1);
  assertEqual(map.get(k2), v2);
  assertEqual(map.get(123), undefined);
  assertEqual(map.getSize(), 2);
  assertThrow(() => {
    map.forEach(/** @type {any} */ (null), null);
  }, "TypeError");
  {
    /**
     * @type {(
     *   & { __proto__: null, length: number }
     *   & { [k in number]: unknown }
     * )}
     */
    const entries = { __proto__: null, length: 0 };
    map.forEach(function (...args) {
      assertEqual(this, 123);
      assertEqual(args.length, 3);
      assertEqual(args[2], map);
      entries[entries.length++] = args[0];
      entries[entries.length++] = args[1];
    }, 123);
    assertEqual(entries.length, 4);
    assertEqual(Linvail.is(entries[1], k1), true);
    assertEqual(entries[0], v1);
    assertEqual(Linvail.is(entries[3], k2), true);
    assertEqual(entries[2], v2);
  }
  assertEqual(map.clear(), undefined);
  assertEqual(map.getSize(), 0);
}

{
  /** @type {(data: unknown) => void} */
  const onCapture = (_data) => {};
  /** @type {(data: unknown) => void} */
  const onRelease = (_data) => {};
  Linvail.addEventListener("capture", onCapture);
  Linvail.addEventListener("release", onRelease);
  Linvail.removeEventListener("capture", onCapture);
  Linvail.removeEventListener("release", onRelease);
}
