
var Oracle = require("./oracle.js");

module.exports = function (stack, data) {
  var oracle = Oracle(data);
  return {
    apply: function (fct, ths, args, ast) {
      stack.push(arguments);
      var res = oracle.apply(fct, ths, args);
      stack.pop(res);
      return res;
    },
    construct: function (cst, args, ast) {
      stack.push(arguments);
      var res = oracle.construct(cts, args);
      stack.pop(res);
      return res;
    },
    try: function (ast) { stack.push(arguments) },
    finally: function () {
      var loc = stack.pop();
      while(loc.type !== "TryStatemnt")
        loc = stack.pop();
    }
  }
}
