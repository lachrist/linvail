var Aran = require("aran");
var Linvail = require("linvail");
// This analysis trace the program's control flow and
// also the program value flow, even primitive values!
function isprimitive (val) {
  return !val || val === true
      || typeof val === "number"
      || typeof val === "string";
}
module.exports = function (options) {
  // Refified callstack
  var stack = [];
  // Primitive values are converted to objects
  var wrappers = new WeakSet();
  // Reified store
  var counter = 0;
  var pointers = new WeakMap();
  // Atomic value printing
  function print (val) {
    if (pointers.has(val))
      return "#"+pointers.get(val);
    if (Array.isArray(val))
      return "[array]";
    switch (typeof val) {
      case "object": return val ? "[object]" : "null";
      case "function": return "[function]";
      case "string": return JSON.stringify(val);
    }
    return String(val);
  }
  // Atomic code location printing
  function loc (idx) {
    if (!idx)
      return idx;
    var start = aran.node(idx).loc.start;
    return aran.source(idx)+"@"+start.line+":"+start.column;
  }
  // Entering primitive values are wrapped.
  // Objects are associated with a unique number.
  function enter (val, idx, ctx) {
    if (isprimitive(val)) {
      val = {inner:val};
      wrappers.add(val);
      pointers.set(val, ++counter);
      options.log(stack.join(".")+" <- #"+counter+"("+print(val.inner)+") at "+loc(idx)+" as "+ctx+"\n");
      return val;
    }
    if (!pointers.has(val))
      pointers.set(val, ++counter);
    options.log(stack.join(".")+" <- "+print(val)+" at "+loc(idx)+" as "+ctx+"\n");
    return val;
  }
  // Leaving wrapped primitive are unwrapped.
  function leave (val, idx, ctx) {
    options.log(stack.join(".")+" -> "+print(val)+" at "+loc(idx)+" as "+ctx+"\n");
    return wrappers.has(val) ? val.inner : val;
  }
  // The traps Try and Catch are not defined by Linvail.
  var linvail = Linvail(enter, leave);
  global._meta_ = {};
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