
var Aran = require("../../aran/main.js");
var Linvail = require("./main.js");

module.exports = function (options) {
  var id = 0;
  var wrappers = new WeakSet();
  function print (x) {
    if (wrappers.has(x))
      return "#"+x.meta;
    if (Array.isArray(x))
      return "[array]";
    switch (typeof x) {
      case "object": return "[object]";
      case "function": return "[function]";
      case "string": return JSON.stringify(x);
    }
    return String(x);
  }
  function loc (i) {
    if (!i)
      return i;
    var n = aran.node(i);
    return aran.source(i)+"@"+n.loc.start.line+":"+n.loc.start.column;
  }
  var active = true;
  function enter (x, i, s) {
    if (!active)
      return x;
    options.log(indent+"<< "+print(x)+" #"+(++id)+" "+loc(i)+" "+s+"\n");
    var w = {base:x, meta:id};
    wrappers.add(w);
    return w;
  }
  function leave (x, i, s) {
    if (!active)
      return x;
    if (wrappers.has(x)) {
      options.log(indent+">> "+print(x.base)+" #"+x.meta+" "+loc(i)+" "+s+"\n");
      return x.base;
    }
    return x;
  }
  var linvail = Linvail(enter, leave);
  global.meta = {};
  var indent = "  ";
  Object.keys(linvail).forEach(function (k) {
    global.meta[k] = function () {
      active = false;
      if (k === "get") {
        var o = arguments[0];
        options.log("WESH\n");
        o.base.a;
        options.log("TOLO\n");
      }
      active = true;
      options.log(indent+"BEFORE "+k+" "+[].map.call(arguments, print).join(" ")+"\n");
      indent += "  ";
      var result = linvail[k].apply(null, arguments);
      indent = indent.substring(0, indent.length-2);
      options.log(indent+"AFTER "+k+" "+print(result)+"\n");
      return result;
    };
  });
  var aran = Aran({
    traps: Object.keys(linvail),
    namespace: "meta",
    loc: true
  });
  return aran.instrument;
}
