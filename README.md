# Linvail

Linvail is a [npm module](https://www.npmjs.com/linvail) implements an access control system inspired from [membrane](https://tvcutsem.github.io/js-membranes).
This module's motivation was to build dynamic analyses capable of tracking primitive values across the object graph.
Originally it was hard-coupled with the JavaScript code instrumenter [Aran](https://www.npmjs.com/aran).
Now, this module can be used on its own.

## Wild Values, Tame Values and Dirty Values

Using Linvail requires to juggle with three sets of values: *Wild*, *Tame* and *Dirty*.
Dirty values can only be obtained by calling the user-defined function `membrane.taint`.
There is no restriction on dirty values because Linvail always uses the other used-defined function `membrane.clean` to clean them before using them in any operation.
Wild values are values which seems to contain only other wild values.
By opposition, tame values seems to only contain dirty values.
A wild value can be converted to a tame value with the Linvail-defined function `capture` and a tame value can be converted to a wild value with the Linvail-defined function `release`.
These two functions involve wrapping objects into [proxies](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) which will perform the appropriate conversion.

![category](img/category.png)

* A *wild value* is either:
  * a primitive
  * an object which satisfies the below constraints:
    * its prototype is a wild value
    * the values of its data properties are wild values
    * the getters and setters of its accessor properties are wild values
    * applying it with a wild value this-argument and wild value arguments will return a wild value or throw a wild value
    * constructing it with a wild value new-target and wild value arguments will return a wild value or throw a wild value
* A *tame value* is either:
  * a primitive
  * an object which satisfies the below constraints:
    * its prototype is a tame value.
    * the values of its data properties are dirty values *except* if the reference is an array; in that case, it's `length` property remains a wild value
    * the getters and setters of its accessor properties are tame values
    * applying it with a dirty value this-argument and dirty value arguments will return a dirty value or throw a *wild value*
    * constructing it with a *tame value* new-target and dirty value arguments will return a dirty value or throw a *wild value*
* The *dirty value* set is defined by the user through the functions `membrane.taint` and `membrane.clean`

```sh
npm install linvail
```

```js
const Linvail = require("linvail");
let counter = 0;
const membrane = {
  taint: (tame) => {
    counter++;
    console.log("@"+counter+" := "+(typeof tame));
    return {base:tame, meta:counter};
  },
  clean: (inner) => {
    console.log("using @"+inner.meta);
    return inner.base;
  }
};
const {capture, release} = Linvail(membrane);
const tame = Object.create(null);
const wild = release(tame);
const dirty = membrane.taint(tame);
tame.foo = membrane.taint(123);
wild.bar = 456;
console.log("A tame object: ", tame);
console.log("Its cleaned values: ", Object.values(wild));
console.log("Its tainted values: ", capture(Object.values)(dirty));
```

```
@1 := object
@2 := number
@3 := number
A tame object:  { foo: { base: 123, meta: 2 }, bar: { base: 456, meta: 3 } }
using @2
using @2
using @3
using @3
Its cleaned values:  [ 123, 456 ]
using @1
@4 := object
@5 := function
@6 := function
@7 := function
Its tainted values:  { base: [ { base: 123, meta: 2 }, { base: 456, meta: 3 } ], meta: 4 }
```

Note how the tamed `Object.values` function was able to conserve the meta tag of its argument's values.
This is possible because Linvail knows about the semantic of several builtin functions to optimize the behavior of their tame counter-part.
This semantic is encoded as a collection of closures collectively named the oracle.

## The oracle

In the general case, applying a foreign tame function involves cleaning-releasing arguments and capturing-tainting the result.
This algorithm always prevent clashes between values sets but it may induce needless cleaning/re-tainting operations.
Consider the wild identity function `(x) => x`; knowing its semantic, we could deduce that it is not needed to clean its argument as it will not perform any operation on it but simply return it.
More specifically, in the code below, we would like that `tainted1` always resolve to the same value as `tainted2`.

```js
const tainted1 = membrane.taint("foo");
const wild = (x) => x;
const tame = access.capture(wild);
const tainted2 = tame(tainted1);
```

Many functions of the global object, could benefit from less cleaning/re-tainting than their tamed counter-part. 
For instance, `Object.values` does not perform any operation on an object's values but simply push them in an array.
Currently, Linvail uses a very rudimentary oracle which simply specifies the cleaning/tainting operations per builtin functions.
At the moment the oracle contains:

* Reflect
  * `Reflect.apply`
  * `Reflect.construct`
  * `Reflect.defineProperty`
  * `Reflect.get`
  * `Reflect.getOwnPropertyDescriptor`;
  * `Reflect.ownKeys`
  * `Reflect.preventExtensions`
  * `Reflect.set`
* Object
  * `Object`
  * `Object.assign`
  * `Object.create`
  * `Object.defineProperties`
  * `Object.defineProperty`
  * `Object.entries`
  * `Object.getOwnPropertyDescriptor`
  * `Object.getOwnPropertyDescriptors`
  * `Object.getOwnPropertyNames`
  * `Object.getOwnPropertySymbols`
  * `Object.keys`
  * `Object.values`
* Array
  * `Array`
  * `Array.from`
  * `Array.of`
* Aran (if the builtins is defined)
  * `AranEnumerate`
  * `AranDefineDataProperty`
  * `AranDefineAccessorProperty`
  * `Object.fromEntries`

The only coupling between Linvail and Aran resides in the oracle.
Aran defines a handful of functions it considers as builtin to help desugar JavaScript code.
These aran-specific builtins can be passed to Linvail to augment the oracle.

## API

### `linvail = require("linvail")(membrane, [options])`

```js
{capture, release} = require("linvail")(membrane, {check, aran.builtins});
```

* `tainted = membrane.taint(tame)`:
  User-defined function to convert a tame value to a dirty value.
* `tame = membrane.clean(tainted)`:
  User-defined function to convert a dirty value to a tame value.
* `check :: boolean`, default `false`:
  Indicates whether runtime checks should be performed within `capture`, `release`, `membrane.taint` and `membrane.clean` to detect clashes between tame values, wild values and inner values.
  This option is for debugging purpose and comes at the cost of performance overhead.
  This option overwrites `membrane.taint` and `membrane.clean`; the original functions are respectively set to `membrane._taint` and `membrane._clean`.
  The original functions will still be called with `this` pointing to the membrane.
* `aran.builtins :: object`, default `null`:
  This option is used to augment the oracle with aran-defined functions.
* `tame = capture(wild)`:
  Convert a wild value into a tame value.
* `wild = release(tame)`:
  Convert a tame value into a wild value.
