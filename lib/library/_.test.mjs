import { loadLibrary } from "./load.mjs";

const { Error, Reflect, undefined } = globalThis;

Error.stackTraceLimit = 1 / 0;

const Linvail = loadLibrary({ missing: "throw" });

/**
 * @type {(
 *   actual: unknown,
 *   expect: unknown,
 *   message: string,
 * ) => void}
 */
const assertEqual = (actual, expect, message) => {
  if (actual !== expect) {
    throw new Error("assertion failure", {
      cause: { actual, expect, message },
    });
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
  assertEqual(typeof actual, "function", "assertClosure:typeof");
  assertEqual(actual.length, length, "assertClosure:length");
  assertEqual(actual.name, name, "assertClosure:name");
};

// dir //
assertClosure(Linvail.dir, { name: "dir", length: 1 });
assertEqual(Linvail.dir(123), undefined, "dir:undefined");

// is //
assertClosure(Linvail.is, { name: "is", length: 2 });
assertEqual(Linvail.is(123, 123), false, "is:literal");
{
  const x = 123;
  assertEqual(Linvail.is(x, x), true, "is:variable");
}

// refresh //
assertClosure(Linvail.refresh, { name: "refresh", length: 1 });
assertEqual(Linvail.refresh(123), 123, "refresh:literal");
{
  const x = 123;
  assertEqual(Linvail.is(x, Linvail.refresh(x)), false, "refresh:variable");
}

// WeakSet //
{
  const k1 = 123;
  const k2 = 123;
  assertClosure(Linvail.WeakSet, {
    name: "LinvailWeakSet",
    length: 0,
  });
  assertEqual(
    Linvail.WeakSet.prototype.constructor,
    Linvail.WeakSet,
    "Linvail.WeakSet.prototype.constructor",
  );
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
   * @type {import("./library.d.ts").LinvailWeakSet<number>}
   */
  const set = new Linvail.WeakSet();
  assertEqual(
    Reflect.getPrototypeOf(set),
    Linvail.WeakSet.prototype,
    "Linvail.WeakSet.prototype",
  );
  assertEqual(set.delete(k1), false, "Linvail.WeakSet.delete");
  assertEqual(set.has(k1), false, "Linvail.WeakSet.has");
  assertEqual(set.add(k1), set, "Linvail.WeakSet.add");
  assertEqual(set.has(k1), true, "Linvail.WeakSet.has");
  assertEqual(set.has(k2), false, "Linvail.WeakSet.has");
  assertEqual(set.delete(k2), false, "Linvail.WeakSet.delete");
  assertEqual(set.delete(k1), true, "Linvail.WeakSet.delete");
  assertEqual(set.has(k1), false, "Linvail.WeakSet.has");
}
{
  const k1 = 123;
  const k2 = 123;
  const collection = new Linvail.WeakSet([k1, k2]);
  assertEqual(collection.has(k1), true, "Linvail.WeakSet.has");
  assertEqual(collection.has(k2), true, "Linvail.WeakSet.has");
  assertEqual(collection.has(123), false, "Linvail.WeakSet.has");
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
  assertEqual(
    Linvail.WeakMap.prototype.constructor,
    Linvail.WeakMap,
    "Linvail.WeakMap.prototype.constructor",
  );
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
   * @type {import("./library.d.ts").LinvailWeakMap<number, string>}
   */
  const map = new Linvail.WeakMap();
  assertEqual(
    Reflect.getPrototypeOf(map),
    Linvail.WeakMap.prototype,
    "Linvail.WeakMap.prototype",
  );
  assertEqual(map.delete(k1), false, "Linvail.WeakMap.delete");
  assertEqual(map.has(k1), false, "Linvail.WeakMap.has");
  assertEqual(map.set(k1, v1), map, "Linvail.WeakMap.set");
  assertEqual(map.has(k1), true, "Linvail.WeakMap.has");
  assertEqual(map.get(k1), v1, "Linvail.WeakMap.get");
  assertEqual(map.get(k2), undefined, "Linvail.WeakMap.get");
  assertEqual(map.has(k2), false, "Linvail.WeakMap.has");
  assertEqual(map.delete(k2), false, "Linvail.WeakMap.delete");
  assertEqual(map.delete(k1), true, "Linvail.WeakMap.delete");
  assertEqual(map.has(k1), false, "Linvail.WeakMap.has");
}
{
  const k1 = 123;
  const k2 = 123;
  const collection = new Linvail.WeakMap([
    [k1, "k1"],
    [k2, "k2"],
  ]);
  assertEqual(collection.get(k1), "k1", "Linvail.WeakMap.get");
  assertEqual(collection.get(k2), "k2", "Linvail.WeakMap.get");
  assertEqual(collection.get(123), undefined, "Linvail.WeakMap.get");
}

// Set //
{
  const k1 = 123;
  const k2 = 123;
  assertClosure(Linvail.Set, {
    name: "LinvailSet",
    length: 0,
  });
  assertEqual(
    Linvail.Set.prototype.constructor,
    Linvail.Set,
    "Linvail.Set.prototype.constructor",
  );
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
   * @type {import("./library.d.ts").LinvailSet<number>}
   */
  const set = new Linvail.Set();
  assertEqual(
    Reflect.getPrototypeOf(set),
    Linvail.Set.prototype,
    "Linvail.Set.prototype",
  );
  assertEqual(set.delete(k1), false, "Linvail.Set.delete");
  assertEqual(set.has(k1), false, "Linvail.Set.has");
  assertEqual(set.getSize(), 0, "Linvail.Set.getSize");
  assertEqual(set.add(k1), set, "Linvail.Set.add");
  assertEqual(set.getSize(), 1, "Linvail.Set.getSize");
  assertEqual(set.has(k1), true, "Linvail.Set.has");
  assertEqual(set.has(k2), false, "Linvail.Set.has");
  assertEqual(set.delete(k1), true, "Linvail.Set.delete");
  assertEqual(set.has(k1), false, "Linvail.Set.has");
  assertEqual(set.add(k1), set, "Linvail.Set.add");
  assertEqual(set.add(k2), set, "Linvail.Set.add");
  assertEqual(set.getSize(), 2, "set.getSize(), 2");
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
      assertEqual(this, 123, "this === 123");
      assertEqual(args.length, 3, "args.length === 3");
      assertEqual(
        Linvail.is(args[0], args[1]),
        true,
        "Linvail.is(args[0], args[1]) === true",
      );
      assertEqual(args[2], set, "args[2] === set");
      keys[keys.length++] = args[0];
    }, 123);
    assertEqual(keys.length, 2, "keys.length === 2");
    assertEqual(Linvail.is(keys[0], k1), true, "Linvail.is(keys[0], k1)");
    assertEqual(Linvail.is(keys[1], k2), true, "Linvail.is(keys[1], k2)");
  }
  assertEqual(set.clear(), undefined, "set.clear()");
  assertEqual(set.getSize(), 0, "set.getSize()");
}
{
  const k1 = 123;
  const k2 = 123;
  const collection = new Linvail.Set([k1, k2]);
  assertEqual(collection.has(k1), true, "collection.has(k1) === true");
  assertEqual(collection.has(k2), true, "collection.has(k2) === true");
  assertEqual(collection.has(123), false, "collection.has(123) === false");
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
  assertEqual(
    Linvail.Map.prototype.constructor,
    Linvail.Map,
    "Linvail.Map.prototype.constructor === Linvail.Map",
  );
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
   * @type {import("./library.d.ts").LinvailMap<number, string>}
   */
  const map = new Linvail.Map();
  assertEqual(
    Reflect.getPrototypeOf(map),
    Linvail.Map.prototype,
    "Reflect.getPrototypeOf(map) === Linvail.Map.prototype",
  );
  assertEqual(map.delete(k1), false, "map.delete(k1) === false");
  assertEqual(map.has(k1), false, "map.has(k1) === false");
  assertEqual(map.getSize(), 0, "map.getSize() === 0");
  assertEqual(map.set(k1, v1), map, "map.set(k1, v1) === map");
  assertEqual(map.getSize(), 1, "map.getSize() === 1");
  assertEqual(map.has(k1), true, "map.has(k1) === true");
  assertEqual(map.has(k2), false, "map.has(k2) === false");
  assertEqual(map.delete(k1), true, "map.delete(k1) === true");
  assertEqual(map.has(k1), false, "map.has(k1) === false");
  assertEqual(map.set(k1, v1), map, "map.set(k1, v1) === map");
  assertEqual(map.set(k2, v2), map, "map.set(k2, v2) === map");
  assertEqual(map.get(k1), v1, "map.get(k1) === v1");
  assertEqual(map.get(k2), v2, "map.get(k2) === v2");
  assertEqual(map.get(123), undefined, "map.get(123) === undefined");
  assertEqual(map.getSize(), 2, "map.getSize() === 2");
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
      assertEqual(this, 123, "this === 123");
      assertEqual(args.length, 3, "args.length === 3");
      assertEqual(args[2], map, "args[2] === map");
      entries[entries.length++] = args[0];
      entries[entries.length++] = args[1];
    }, 123);
    assertEqual(entries.length, 4, "entries.length === 4");
    assertEqual(
      Linvail.is(entries[1], k1),
      true,
      "Linvail.is(entries[1], k1) === true",
    );
    assertEqual(entries[0], v1, "entries[0] === v1");
    assertEqual(
      Linvail.is(entries[3], k2),
      true,
      "Linvail.is(entries[3], k2) === true",
    );
    assertEqual(entries[2], v2, "entries[2] === v2");
  }
  assertEqual(map.clear(), undefined, "map.clear() === undefined");
  assertEqual(map.getSize(), 0, "map.getSize() === 0");
}
{
  const k1 = 123;
  const k2 = 123;
  const collection = new Linvail.Map([
    [k1, "k1"],
    [k2, "k2"],
  ]);
  assertEqual(collection.get(k1), "k1", "collection.get(k1) === 'k1'");
  assertEqual(collection.get(k2), "k2", "collection.get(k2) === 'k2'");
  assertEqual(
    collection.get(123),
    undefined,
    "collection.get(123) === undefined",
  );
}
