import { library_hidden_variable } from "../../library/library-variable.mjs";

const { undefined, Error, eval: evalGlobal, Object, Array } = globalThis;

Error.stackTraceLimit = 1 / 0;

/**
 * @typedef {{
 *   __proto__: null,
 *   value: unknown,
 *   writable: boolean,
 *   enumerable: boolean,
 *   configurable: boolean,
 * } | {
 *   __proto__: null,
 *   get: undefined | (() => unknown),
 *   set: undefined | ((value: unknown) => void),
 *   enumerable: boolean,
 *   configurable: boolean,
 * }} Descriptor
 */

/**
 * @type {typeof globalThis["Reflect"]}
 */
const Reflect = /** @type {any} */ evalGlobal(`{
  const { Reflect } = globalThis;
  const copy = {__proto__: null};
  for (const name of Reflect.ownKeys(Reflect)) {
    const closure = Reflect[name];
    if (typeof closure === "function") {
      copy[name] = (...args) => closure(...args);
    }
  }
  copy;
}`);

/**
 * @type {(
 *   expect: unknown,
 *   actual: unknown,
 * ) => void}
 */
const assertEqual = (expect, actual) => {
  if (expect !== actual) {
    throw new Error("assertion failure", {
      cause: { expect, actual },
    });
  }
};

/**
 * @type {(
 *   actual: undefined | PropertyDescriptor,
 *   expect: Descriptor,
 * ) => void}
 */
const assertEqualDescriptor = (actual, expect) => {
  if (actual == null) {
    throw new Error("missing descriptor", {
      cause: { actual, expect },
    });
  }
  if ("value" in expect) {
    assertEqual(Object.hasOwn(actual, "value"), true);
    assertEqual(actual.value, expect.value);
    assertEqual(actual.writable, expect.writable);
    assertEqual(actual.enumerable, expect.enumerable);
    assertEqual(actual.configurable, expect.configurable);
  } else {
    assertEqual(Object.hasOwn(actual, "value"), false);
    assertEqual(actual.get, expect.get);
    assertEqual(actual.set, expect.set);
    assertEqual(actual.enumerable, expect.enumerable);
    assertEqual(actual.configurable, expect.configurable);
  }
};

/**
 * @type {(
 *   actual: unknown[],
 *   expect: unknown[],
 * ) => void}
 */
const assertEqualArray = (actual, expect) => {
  assertEqual(Array.isArray(actual), true);
  assertEqual(Array.isArray(expect), true);
  assertEqual(actual.length, expect.length);
  for (let index = 0; index < actual.length; index++) {
    assertEqual(actual[index], expect[index]);
  }
};

////////////////////////
// apply && construct //
////////////////////////

assertEqual(
  Reflect.apply(
    function () {
      return this;
    },
    123,
    [],
  ),
  123,
);

assertEqualArray(
  Reflect.apply(
    function (...input) {
      return input;
    },
    null,
    [123, 456],
  ),
  [123, 456],
);

assertEqual(
  Reflect.construct(
    function () {
      return new.target;
    },
    [],
    function new_target() {},
  ).name,
  "new_target",
);

assertEqualArray(
  Reflect.construct(
    function (/** @type {number[]} */ ...input) {
      return input;
    },
    [123, 456],
  ),
  [123, 456],
);

/////////////////////////////
// prototype && extensible //
/////////////////////////////

assertEqual(Reflect.getPrototypeOf({}), Object.prototype);

assertEqual(Reflect.getPrototypeOf([]), Array.prototype);

assertEqual(Reflect.getPrototypeOf({ __proto__: null }), null);

{
  const target = {};
  assertEqual(Reflect.setPrototypeOf(target, null), true);
  assertEqual(Reflect.getPrototypeOf(target), null);
}

{
  const target = { __proto__: null };
  assertEqual(Reflect.setPrototypeOf(target, Object.prototype), true);
  assertEqual(Reflect.getPrototypeOf(target), Object.prototype);
}

{
  const target = { __proto__: null };
  assertEqual(Reflect.isExtensible(target), true);
  assertEqual(Reflect.preventExtensions(target), true);
  assertEqual(Reflect.isExtensible(target), false);
  assertEqual(Reflect.setPrototypeOf(target, Object.prototype), false);
  assertEqual(Reflect.getPrototypeOf(target), null);
}

/////////////
// ownKeys //
/////////////

{
  const keys = Reflect.ownKeys({ foo: 123, bar: 456 });
  assertEqual(keys.length, 2);
  assertEqual(keys[0], "foo");
  assertEqual(keys[1], "bar");
}

////////////////////////////////////////////////
// defineProperty && getOwnPropertyDescriptor //
////////////////////////////////////////////////

// Missing //
assertEqual(Reflect.getOwnPropertyDescriptor({}, "foo"), undefined);

// Empty //
{
  const target = {};
  const descriptor = { __proto__: null };
  assertEqual(Reflect.defineProperty(target, "foo", descriptor), true);
  assertEqualDescriptor(Reflect.getOwnPropertyDescriptor(target, "foo"), {
    __proto__: null,
    value: undefined,
    writable: false,
    enumerable: false,
    configurable: false,
  });
}

// Non-Extensible //
{
  const target = {};
  assertEqual(Reflect.preventExtensions(target), true);
  assertEqual(Reflect.defineProperty(target, "foo", { value: 123 }), false);
  assertEqual(Reflect.getOwnPropertyDescriptor(target, "foo"), undefined);
}

// Internal Data Descriptor //
{
  const target = {};
  const descriptor = {
    __proto__: null,
    value: 123,
    writable: true,
    enumerable: true,
    configurable: true,
  };
  assertEqual(Reflect.defineProperty(target, "foo", descriptor), true);
  assertEqualDescriptor(
    Reflect.getOwnPropertyDescriptor(target, "foo"),
    descriptor,
  );
}

// External Data Descriptor //
{
  const target = {};
  const descriptor = evalGlobal(`({
    __proto__: null,
    value: 123,
    writable: true,
    enumerable: true,
    configurable: true,
  });`);
  assertEqual(Reflect.defineProperty(target, "foo", descriptor), true);
  assertEqualDescriptor(
    Reflect.getOwnPropertyDescriptor(target, "foo"),
    descriptor,
  );
}

// Internal Accessor Descriptor //
{
  const target = {};
  const descriptor = {
    __proto__: null,
    get() {},
    set: /** @type {any} */ (undefined),
    enumerable: true,
    configurable: true,
  };
  assertEqual(Reflect.defineProperty(target, "foo", descriptor), true);
  assertEqualDescriptor(
    Reflect.getOwnPropertyDescriptor(target, "foo"),
    descriptor,
  );
}

// External Accessor Descriptor //
{
  const target = {};
  const descriptor = evalGlobal(`({
    __proto__: null,
    get() {},
    set: undefined,
    enumerable: true,
    configurable: true,
  });`);
  assertEqual(Reflect.defineProperty(target, "foo", descriptor), true);
  assertEqualDescriptor(
    Reflect.getOwnPropertyDescriptor(target, "foo"),
    descriptor,
  );
}

// Array >> Non-Length Property //
{
  const target = [123, 456];
  const descriptor = {
    __proto__: null,
    value: 789,
    writable: true,
    enumerable: true,
    configurable: true,
  };
  assertEqual(Reflect.defineProperty(target, 1, descriptor), true);
  assertEqualDescriptor(
    Reflect.getOwnPropertyDescriptor(target, 1),
    descriptor,
  );
}

// Array >> Length Property //
{
  const target = [123, 456];
  const descriptor = {
    __proto__: null,
    value: 1,
    writable: true,
    enumerable: false,
    configurable: false,
  };
  assertEqual(Reflect.defineProperty(target, "length", descriptor), true);
  assertEqualDescriptor(
    Reflect.getOwnPropertyDescriptor(target, "length"),
    descriptor,
  );
}

////////////////////
// deleteProperty //
////////////////////

{
  const target = { foo: 123 };
  assertEqual(Reflect.deleteProperty(target, "foo"), true);
  assertEqual(Reflect.getOwnPropertyDescriptor(target, "foo"), undefined);
}

{
  const target = {};
  const descriptor = {
    __proto__: null,
    value: 123,
    configurable: false,
    enumerable: true,
    writable: true,
  };
  assertEqual(Reflect.defineProperty(target, "foo", descriptor), true);
  assertEqual(Reflect.deleteProperty(target, "foo"), false);
  assertEqualDescriptor(
    Reflect.getOwnPropertyDescriptor(target, "foo"),
    descriptor,
  );
}

/////////
// has //
/////////

// Missing //
assertEqual(Reflect.has({ __proto__: null }, "foo"), false);

// Own //
assertEqual(Reflect.has({ __proto__: null, foo: 123 }, "foo"), true);

// Internal Prototype //
assertEqual(
  Reflect.has({ __proto__: { __proto__: null, foo: 123 } }, "foo"),
  true,
);

// External Prototype //
assertEqual(
  Reflect.has(
    { __proto__: evalGlobal("({ __proto__: null, foo: 123 });") },
    "foo",
  ),
  true,
);

/////////
// get //
/////////

// Internal|External Prototype Object|Array >> Missing //
for (const prototype of [
  { __proto__: null },
  evalGlobal("({ __proto__: null });"),
  Object.setPrototypeOf([], null),
  evalGlobal("Object.setPrototypeOf([], null);"),
]) {
  const target = { __proto__: prototype };
  assertEqual(Reflect.get(target, "foo"), undefined);
}

// Internal Array >> Length Data //
assertEqual(Reflect.get([123, 456, 789], "length"), 3);

// Internal|External Prototype Object|Array >> Data //
for (const prototype of [{}, evalGlobal("({});"), [], evalGlobal("([]);")]) {
  const descriptor = { __proto__: null, value: 123 };
  assertEqual(Reflect.defineProperty(prototype, "foo", descriptor), true);
  const target = { __proto__: prototype };
  assertEqual(Reflect.get(target, "foo"), 123);
}

// Internal|External Prototype Object|Array >> Missing Getter //
for (const prototype of [{}, evalGlobal("({});"), [], evalGlobal("([]);")]) {
  const descriptor = { __proto__: null, set() {} };
  assertEqual(Reflect.defineProperty(prototype, "foo", descriptor), true);
  const target = { __proto__: prototype };
  assertEqual(Reflect.get(target, "foo"), undefined);
}

// Internal|External Prototype Object|Array >> Internal|External Getter //
for (const get of /** @type {((this: number) => number)[]} */ ([
  function () {
    return this;
  },
  evalGlobal("'use strict'; (function () { return this; });"),
])) {
  for (const prototype of [{}, evalGlobal("({});"), [], evalGlobal("([]);")]) {
    const descriptor = { __proto__: null, get };
    assertEqual(Reflect.defineProperty(prototype, "foo", descriptor), true);
    const target = { __proto__: prototype };
    assertEqual(Reflect.get(target, "foo", 123), 123);
  }
}

/////////
// set //
/////////

// Internal Object >> Missing //
{
  const target = { __proto__: null };
  assertEqual(Reflect.set(target, "foo", 123), true);
  assertEqualDescriptor(Reflect.getOwnPropertyDescriptor(target, "foo"), {
    __proto__: null,
    value: 123,
    writable: true,
    enumerable: true,
    configurable: true,
  });
}

// Internal Array >> Length Data //
{
  const target = [123, 456, 789];
  assertEqual(Reflect.set(target, "length", 2), true);
  assertEqualDescriptor(Reflect.getOwnPropertyDescriptor(target, "length"), {
    __proto__: null,
    value: 2,
    writable: true,
    enumerable: false,
    configurable: false,
  });
}

// Internal Array >> Non-Length Data //
{
  const target = [123, 456];
  assertEqual(Reflect.set(target, 1, 789), true);
  assertEqualDescriptor(Reflect.getOwnPropertyDescriptor(target, 1), {
    __proto__: null,
    value: 789,
    writable: true,
    enumerable: true,
    configurable: true,
  });
}

// Internal|External Prototype Object|Array >> Writable Data //
for (const prototype of [{}, evalGlobal("({});"), [], evalGlobal("([]);")]) {
  const descriptor = {
    __proto__: null,
    value: 123,
    writable: true,
    enumerable: false,
    configurable: true,
  };
  assertEqual(Reflect.defineProperty(prototype, "foo", descriptor), true);
  const target = { __proto__: prototype };
  assertEqual(Reflect.set(target, "foo", 456), true);
  assertEqualDescriptor(Reflect.getOwnPropertyDescriptor(target, "foo"), {
    __proto__: null,
    value: 456,
    writable: true,
    enumerable: true,
    configurable: true,
  });
}

// Internal|External Prototype Object|Array >> Non-Writable Data //
for (const prototype of [{}, evalGlobal("({});"), [], evalGlobal("([]);")]) {
  const descriptor = {
    __proto__: null,
    value: 123,
    writable: false,
    enumerable: false,
    configurable: true,
  };
  assertEqual(Reflect.defineProperty(prototype, "foo", descriptor), true);
  const target = { __proto__: prototype };
  assertEqual(Reflect.set(target, "foo", 456), false);
  assertEqual(Reflect.getOwnPropertyDescriptor(target, "foo"), undefined);
}

// Internal|External Prototype Object|Array >> Internal|External Setter //
for (const set of /** @type {((this: { arg: number }, arg: number) => void)[]} */ ([
  function (arg) {
    this.arg = arg;
  },
  evalGlobal("'use strict'; (function (arg) { this.arg = arg; });"),
])) {
  for (const prototype of [{}, evalGlobal("({});"), [], evalGlobal("([]);")]) {
    const descriptor = {
      __proto__: null,
      set,
      configurable: false,
    };
    assertEqual(Reflect.defineProperty(prototype, "foo", descriptor), true);
    const target = { __proto__: prototype };
    const receiver = { arg: 123 };
    assertEqual(Reflect.set(target, "foo", 456, receiver), true);
    assertEqual(receiver.arg, 456);
  }
}

// Internal|External Prototype Object|Array >> Missing Setter //
for (const prototype of [{}, evalGlobal("({});"), [], evalGlobal("([]);")]) {
  const descriptor = { __proto__: null, get() {} };
  assertEqual(Reflect.defineProperty(prototype, "foo", descriptor), true);
  const target = { __proto__: prototype };
  assertEqual(Reflect.set(target, "foo", 456), false);
}

//////////////
// Listener //
//////////////

if (library_hidden_variable in globalThis) {
  /** @type {import("../../library/library.d.ts").Library} */
  const Linvail = /** @type {any} */ (globalThis)[library_hidden_variable];
  /**
   * @type {{
   *   type: "capture" | "release",
   *   data: unknown,
   * }[]}
   */
  const stack = [];
  let active = false;
  /**
   * @type {(
   *   type: "capture" | "release",
   * ) => (
   *   value: unknown,
   * ) => void}
   */
  const compileListener = (type) => (data) => {
    if (active) {
      stack.push({ type, data });
    }
  };
  const capture = compileListener("capture");
  const release = compileListener("release");
  const capture_symbol = Linvail.addEventListener("capture", capture);
  const release_symbol = Linvail.addEventListener("release", release);
  active = true;
  typeof 123;
  active = false;
  assertEqual(Linvail.removeEventListener("capture", capture_symbol), true);
  assertEqual(Linvail.removeEventListener("release", release_symbol), true);
  assertEqual(
    stack.some(({ type, data }) => type === "release" && data === 123),
    true,
  );
  assertEqual(
    stack.some(({ type, data }) => type === "capture" && data === 123),
    true,
  );
}
