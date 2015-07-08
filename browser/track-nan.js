var calls = [];
function unwrap (ctx) { return NaN }
var intercept = {
  primitive: function (val, ctx) {
    if (isNaN(val)) {
      var call = calls[calls.length-1];
      var info = call.function.name+"@"+call.context.loc.start.line;
      return {call:call, unwrap:unwrap};
    }
    return val;
  },
  object: function (obj, ctx) { return obj }
};
var Linvail = require("..");
module.exports = Linvail(intercept, calls);