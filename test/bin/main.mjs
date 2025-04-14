/* eslint-disable */

import { ok as assert } from "node:assert";
import { identity } from "./identity.mjs";
import { env } from "node:process";
import * as Linvail from "../../lib/library.mjs";

const {
  globalThis: global,
  eval: evalGlobal,
  Reflect: { get, set },
} = globalThis;

/////////////////
// Environment //
/////////////////

{
  const foo1 = 123;
  const foo2 = foo1;
  assert(Linvail.is(foo1, foo2));
  Linvail.dir(foo1);
}

///////////////
// Exclusion //
///////////////

{
  const foo1 = 123;
  const foo2 = identity(foo1);
  assert(
    Linvail.is(foo1, foo2) === (env.LINVAIL_EXCLUDE !== "**/identity.mjs"),
  );
}

///////////
// Store //
///////////

{
  const foo1 = 123;
  const object = { foo: foo1 };
  const foo2 = get(object, "foo");
  assert(Linvail.is(foo1, foo2));
}

{
  const foo1 = 123;
  const object = {};
  assert(set(object, "foo", foo1, object));
  const foo2 = get(object, "foo");
  assert(Linvail.is(foo1, foo2));
}

///////////////////
// Global Object //
///////////////////

assert(evalGlobal("this;") === global);

{
  const foo1 = 123;
  assert(set(global, "foo", foo1, global));
  const foo2 = get(global, "foo");
  assert(Linvail.is(foo1, foo2) === (env.LINVAIL_GLOBAL_OBJECT === "internal"));
}

//////////////////
// Dynamic Code //
//////////////////

{
  const foo1 = 123;
  const foo2 = eval("foo1;");
  assert(Linvail.is(foo1, foo2));
}

{
  const foo1 = 123;
  const identity = evalGlobal("((arg) => arg);");
  const foo2 = identity(foo1);
  assert(
    Linvail.is(foo1, foo2) === (env.LINVAIL_GLOBAL_DYNAMIC_CODE !== "external"),
  );
}

{
  const foo1 = 123;
  const identity = new Function("arg", "return arg;");
  const foo2 = identity(foo1);
  assert(
    Linvail.is(foo1, foo2) === (env.LINVAIL_GLOBAL_DYNAMIC_CODE !== "external"),
  );
}

{
  const foo1 = 123;
  const identity = Function("arg", "return arg;");
  const foo2 = identity(foo1);
  assert(
    Linvail.is(foo1, foo2) === (env.LINVAIL_GLOBAL_DYNAMIC_CODE !== "external"),
  );
}

////////////////
// Collection //
////////////////

{
  const key1 = 123;
  const val1 = 456;
  const key2 = 123;
  const val2 = 456;
  const map = new Linvail.WeakMap([[key1, val1]]);
  assert(map.has(key1));
  assert(!map.has(key2));
  assert(Linvail.is(map.get(key1), val1));
  assert(!Linvail.is(map.get(key2), val2));
  assert(map.get(key2) === undefined);
  assert(map.delete(key2) === false);
  assert(map.delete(key1) === true);
  assert(!map.has(key1));
  assert(map.set(key2, val2) === map);
  assert(map.has(key2));
  assert(Linvail.is(map.get(key2), val2));
}
