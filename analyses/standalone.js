var Aran = require("aran");
var Esprima = require("esprima");
var Linvail = require("linvail");
var wrappers = new WeakSet();
var counter = 0;
function enter (value, serial, context) {
  var node = aran.node(serial);
  var wrapper = {base:value,meta:counter++};
  wrappers.add(wrapper);
  return wrapper;
}
function leave (value, serial, context) {
  var node = aran.node(serial);
  if (wrappers.has(value)) {
    console.log("leave#"+value.meta, value.base, node.loc.start, context);
    return value.base;
  }
  console.log("leave", value, node.loc.start, context);
  return value;
}
const linvail = Linvail(enter, leave);
const traps = Object.assign({}, linvail);
traps.apply = function (closure, self, arguments, serial) {
  var node = aran.node(serial);
  console.log("apply", closure, self, arguments, node.loc.start);
  const result = linvail.apply(closure, self, arguments, serial);
  console.log("return", result);
  return result;
};
var namespace = "_meta_";
global[namespace] = traps;
var aran = Aran(namespace);
var program = Esprima.parse([
  "function identity (x) {",
  "  return x;",
  "}",
  "var x = identity(2) + 3;"
].join("\n"), {loc:true});
eval(aran.instrument(program, Object.keys(traps)));