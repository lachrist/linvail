var Aran = require("aran");
var Linvail = require("linvail");
// This analysis does nothing! *yay*
module.exports = function (options) {
  // Values entering instrumented code are forwarded
  function enter (val, idx, ctx) { return val }
  // Values leaving instrumented code are forwarded
  function leave (val, idx, ctx) { return val }
  global._meta_ = Linvail(enter, leave);
  var aran = Aran({
    traps: Object.keys(global._meta_),
    namespace: "_meta_",
    loc: true
  });
  return aran.instrument;
};