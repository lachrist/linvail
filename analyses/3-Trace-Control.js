var Aran = require("aran");
var Linvail = require("linvail");
// This analysis traces the program's control flow.
// It could have been done directly with Aran!
function identity (x) { return x }
// To avoid looping this function should not trigger
// user-defined code such as proxy traps!
function print (val) {
  if (Array.isArray(val))
    return "[array]";
  switch (typeof val) {
    case "object": return val ? "[object]" : "null";
    case "function": return "[function]";
    case "string": return JSON.stringify(val);
  }
  return String(val);
}
module.exports = function (options) {
  // Reification of the program's callstack.
  var stack = [];
  // The identity membrane is used.
  var linvail = Linvail(identity, identity);
  global._meta_ = {};
  // Linvail does not defines Try nor Finally traps.
  Object.keys(linvail).forEach(function (key) {
    global._meta_[key] = function () {
      options.log(stack.join(".")+" >> "+key+"("+[].map.call(arguments, print).join(", ")+")\n");
      stack.push(key);
      var res = linvail[key].apply(null, arguments);
      stack.pop();
      options.log(stack.join(".")+" << "+print(res)+"\n");
      return res;
    };
  });
  // Try => Mark the stack.
  global._meta_.try = function (idx) {
    stack.push("try");
  };
  // Finally => restaure the stack.
  global._meta_.finally = function (idx) {
    while (stack.pop() !== "try");
  };
  var aran = Aran({
    traps: Object.keys(global._meta_),
    namespace: "_meta_",
    loc: true
  });
  return aran.instrument;
};