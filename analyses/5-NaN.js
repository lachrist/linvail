var Aran = require("aran");
var Linvail = require("linvail");
// This analysis tracks NaN values for debugging purposes.
// It is a combination of 3-Trace and 2-Wrapper.
module.exports = function (options) {
  var stack = [];
  var NaNs = new WeakSet();
  var counter = 0;
  function print (val) {
    if (NaNs.has(val))
      return "#"+val.id;
    if (Array.isArray(val))
      return "[array]";
    switch (typeof val) {
      case "object": return val ? "[object]" : "null";
      case "function": return "[function]";
      case "string": return JSON.stringify(val);
    }
    return String(val);
  }
  function loc (idx) {
    if (!idx)
      return idx;
    var start = aran.node(idx).loc.start;
    return aran.source(idx)+"@"+start.line+":"+start.column;
  }
  function enter (val, idx, ctx) {
    // NaN is the only value which is not equal to itself
    if (val === val)
      return val;
    options.log(stack.join(".")+" NaN #"+(++counter)+" appeared at "+loc(idx)+" as "+ctx+"\n");
    var marker = {id:counter};
    NaNs.add(marker);
    return marker;
  }
  function leave (val, idx, ctx) {
    if (!NaNs.has(val))
      return val;
    options.log(stack.join(".")+" NaN #"+val.id+" used at "+loc(idx)+" as "+ctx+"\n");
    return NaN;
  }
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
  global._meta_.try = function (idx) {
    stack.push("try");
  };
  global._meta_.finally = function (idx) {
    while (callstack.pop() !== "try");
  };
  var aran = Aran({
    traps: Object.keys(global._meta_),
    namespace: "_meta_",
    loc: true
  });
  return aran.instrument;
};