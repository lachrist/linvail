var intercept = {
  primitive: function (val, ctx) { return val },
  object: function (obj, ctx) { return obj }
};
var callstack = {
  push: function (call) {},
  pop: function (res) {}
};
module.exports = Linvail(intercept, callstack);