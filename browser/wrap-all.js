var calls = [];

function unwrap (ctx) { return NaN }
var intercept = {
  primitive: function (val, ctx) {
    if (isNaN(val))
      return {call:calls[calls.length-1], unwrap:unwrap};
    return val;
  },
  object: function (obj, ctx) { return obj }
};

var Linvail = require("..");
module.exports = Linvail(intercept, calls);