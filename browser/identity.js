
var Linvail = require("..");

function unwrap () { return this.inner }

var intercept = {
  primitive: function (val, ctx) { return {inner:val, unwrap:unwrap} },
  object: function (obj, ctx) { return obj }
};

var callstack = {
  push: function (call) {},
  pop: function (res) {}
};

module.exports = Linvail(intercept, callstack);
