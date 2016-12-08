# Linvail

Linvail is an [npm module](https://www.npmjs.com/linvail) built on top of [Aran](https://github.com/lachrist/aran) which enables so called ``heavy-wieght'' dynamic analyses of JavaScript programs.
To install, run `npm install aran linvail`.
Technically, invoking the top-level function of this module returns the Aran's traps necessary to implement a transitive membrane around the instrumented code.
In clear that means that Linvail enables you to intercept all the values entering and leaving instrumented code areas.
As shown below, tracking the instrumented program's values then becomes easy by wrapping them as they enter and unwrapping them as the leave.
In [Linvail's demo page](http://rawgit.com/lachrist/linvail/master/demo/index.html) you can experiment other analyses which actually do something.

```js
var Aran = require("aran");
var Linvail = require("linvail");
// No observable effects but all values flowing
// through the instrumented code are wrappers!
module.exports = function (options) {
  // Testing for an `inner` field is not good enough.
  // We use this collection to be sure we are not
  // confusing wrappers and resembling program's
  // values.
  var wrappers = new WeakSet();
  // All entering values are wrapped
  function enter (val, idx, ctx) {
    var wrp = {inner:val};
    wrappers.add(wrp);
    return wrp;
  }
  // If a leaving value is a wrapper, it is unwrapped
  function leave (val, idx, ctx) {
    return wrappers.has(val) ? val.inner : val;
  }
  global._meta_ = Linvail(enter, leave);
  var aran = Aran({
    traps: Object.keys(global._meta_),
    namespace: "_meta_",
    loc: true
  });
  return aran.instrument;
};
```
