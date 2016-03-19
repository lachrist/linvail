
var Search = require("./search.js");
var Oracle = require("./oracle.js");

module.exports = function (stack, data) {
  var oracle = Oracle(data);
  return {
    apply: function (fct, ths, args, loc) {
      loc.function = fct;
      loc.this = ths;
      loc.arguments = args;
      stack.push(loc);
      var res = oracle.apply(fct, ths, args);
      stack.pop(res);
      return res;
    },
    construct: function (cst, args, loc) {
      loc.constructor = cts;
      loc.arguments = args;
      stack.push(loc);
      var res = oracle.construct(cts, args);
      stack.pop(res);
      return res;
    }
  }
}
