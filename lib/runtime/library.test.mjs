const { Error, Linvail, Reflect, undefined } =
  /** @type {typeof globalThis & {Linvail: import("./library").Linvail}} */ (
    globalThis
  );

// /** @type {(check: boolean, message: string) => void} */
// const assert = (check, message) => {
//   if (!check) {
//     throw new Error(message);
//   }
// };

/**
 * @type {(
 *   actual: unknown,
 *   expect: unknown,
 *   message: string,
 * ) => void}
 */
const assertEqual = (actual, expect, message) => {
  if (actual !== expect) {
    throw new Error(message, { cause: { actual, expect } });
  }
};

/**
 * @type {(
 *   actual: function,
 *   options: {
 *     name: string,
 *     length: number,
 *     suite: string,
 *   },
 * ) => void}
 */
const assertClosure = (actual, { name, length, suite }) => {
  assertEqual(typeof actual, "function", `${suite}-${name}-typeof`);
  assertEqual(actual.length, length, `${suite}-${name}-length`);
  assertEqual(actual.name, name, `${suite}-${name}-name`);
};

// dir //
assertClosure(Linvail.dir, { name: "dir", length: 1, suite: "dir" });
assertEqual(Linvail.dir(123), undefined, "dir");

// Same //
assertClosure(Linvail.same, { name: "same", length: 2, suite: "same" });
assertEqual(Linvail.same(123, 123), false, "same");
{
  const x = 123;
  assertEqual(Linvail.same(x, x), true, "same");
}

// WeakSet //
{
  const x = 123;
  const y = 123;
  assertClosure(Linvail.WeakSet, {
    name: "LinvailWeakSet",
    length: 0,
    suite: "weakset",
  });
  assertClosure(Linvail.WeakSet.prototype.add, {
    name: "add",
    length: 1,
    suite: "weakset",
  });
  assertClosure(Linvail.WeakSet.prototype.delete, {
    name: "delete",
    length: 1,
    suite: "weakset",
  });
  assertClosure(Linvail.WeakSet.prototype.has, {
    name: "has",
    length: 1,
    suite: "weakset",
  });
  /**
   * @type {import("./library").LinvailWeakSet<number>}
   */
  const set = new Linvail.WeakSet();
  Linvail.dir({
    actual: Reflect.getPrototypeOf(set),
    expect: Linvail.WeakSet.prototype,
  });
  assertEqual(
    Reflect.getPrototypeOf(set),
    Linvail.WeakSet.prototype,
    "weakset-prototype",
  );
  assertEqual(set.delete(x), false, "weakset-delete");
  assertEqual(set.has(x), false, "weakset-has");
  assertEqual(set.add(x), set, "weakset-add");
  assertEqual(set.has(x), true, "weakset-has");
  assertEqual(set.has(y), false, "weakset-has");
  assertEqual(set.delete(x), true, "weakset-delete");
  assertEqual(set.has(x), false, "weakset-has");
}
