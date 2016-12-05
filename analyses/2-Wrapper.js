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