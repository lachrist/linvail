import {
  strictEqual as assertEqual,
  deepStrictEqual as assertDeepEqual,
} from "node:assert";
import {
  deleteMap,
  forEachMap,
  getMap,
  getMapSize,
  createMap,
  setMap,
  createSet,
  hasMap,
  getSetSize,
  addSet,
  forEachSet,
  hasSet,
  deleteSet,
  clearMap,
  clearSet,
  createWeakSet,
  hasWeakSet,
  addWeakSet,
  deleteWeakSet,
  createWeakMap,
  hasWeakMap,
  setWeakMap,
  deleteWeakMap,
  getWeakMap,
} from "./collection.mjs";

const { undefined } = globalThis;

/////////
// Set //
/////////
{
  const set = createSet([123, 456]);
  assertEqual(getSetSize(set), 2);
  assertEqual(addSet(set, 789), set);
  assertEqual(getSetSize(set), 3);
  {
    /** @type {unknown[]} */
    const calls = [];
    assertEqual(
      forEachSet(
        set,
        function (...args) {
          assertEqual(this, "this");
          calls[calls.length] = args;
        },
        "this",
      ),
      undefined,
    );
    assertDeepEqual(calls, [
      [123, 123, set],
      [456, 456, set],
      [789, 789, set],
    ]);
  }
  assertEqual(hasSet(set, 456), true);
  assertEqual(deleteSet(set, 456), true);
  assertEqual(hasSet(set, 456), false);
  assertEqual(deleteSet(set, 456), false);
  assertEqual(clearSet(set), undefined);
  assertEqual(getSetSize(set), 0);
}

/////////////
// WeakSet //
/////////////
{
  const key1 = { foo: 123 };
  const key2 = { foo: 456 };
  const key3 = { foo: 789 };
  const set = createWeakSet([key1, key2]);
  assertEqual(hasWeakSet(set, key1), true);
  assertEqual(hasWeakSet(set, key3), false);
  assertEqual(addWeakSet(set, key3), set);
  assertEqual(hasWeakSet(set, key3), true);
  assertEqual(deleteWeakSet(set, key3), true);
  assertEqual(hasWeakSet(set, key3), false);
  assertEqual(deleteWeakSet(set, key3), false);
}

/////////
// Map //
/////////
{
  const map = createMap([
    ["foo", 123],
    ["bar", 456],
  ]);
  assertEqual(getMapSize(map), 2);
  assertEqual(setMap(map, "qux", 789), map);
  assertEqual(getMapSize(map), 3);
  assertEqual(getMap(map, "foo"), 123);
  assertEqual(getMap(map, "qux"), 789);
  {
    /** @type {unknown[]} */
    const calls = [];
    assertEqual(
      forEachMap(
        map,
        function (...args) {
          assertEqual(this, "this");
          calls[calls.length] = args;
        },
        "this",
      ),
      undefined,
    );
    assertDeepEqual(calls, [
      [123, "foo", map],
      [456, "bar", map],
      [789, "qux", map],
    ]);
  }
  assertEqual(hasMap(map, "bar"), true);
  assertEqual(deleteMap(map, "bar"), true);
  assertEqual(hasMap(map, "bar"), false);
  assertEqual(deleteMap(map, "bar"), false);
  assertEqual(clearMap(map), undefined);
  assertEqual(getMapSize(map), 0);
}

/////////////
// WeakMap //
/////////////
{
  const key1 = { foo: 123 };
  const key2 = { foo: 456 };
  const key3 = { foo: 789 };
  const map = createWeakMap([
    [key1, 123],
    [key2, 456],
  ]);
  assertEqual(hasWeakMap(map, key1), true);
  assertEqual(hasWeakMap(map, key3), false);
  assertEqual(setWeakMap(map, key3, 789), map);
  assertEqual(hasWeakMap(map, key3), true);
  assertEqual(getWeakMap(map, key3), 789);
  assertEqual(deleteWeakMap(map, key3), true);
  assertEqual(getWeakMap(map, key3), undefined);
  assertEqual(hasWeakMap(map, key3), false);
  assertEqual(deleteWeakMap(map, key3), false);
}
