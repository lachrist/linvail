
var Linvail = require("linvail");
// Wrapper //
var wrappers = new WeakSet();
var counter = 0;
function wrap (x, ctx) {
  var w = {inner:x, unwrap:unwrap, id:++counter};
  wrappers.add(w);
  console.log("wrap "+ctx+" "+printers.raw(x)+" into "+printers.wrapper(w));
  return w;
}
function unwrap (ctx) {
  console.log("unwrap "+ctx+" "+printers.wrapper(this));
  return this.inner;
}
// Printers //
var printers = {};
printers.node = function (node) { return node.type + "@" + node.loc.start.line + ":" + node.loc.start.column };
printers.wrapper = function (x) { return wrappers.has(x) && "#"+x.id };
printers.raw = function (x) {
  if (typeof x === "string")
    return JSON.stringify(x);
  if (typeof x === "boolean" || typeof x === "number")
    return String(x);
  if (typeof x === "function")
    return "[function]";
  if (Array.isArray(x))
    return "[array]";
  return "[object]";
};
printers.value = function (x) { return printers.wrapper(x) || printers.raw(x) };
printers.call = function (call) {
  return "{" + (("constructor" in call) ? "function:"+printers.value(call.function) : "constructor:"+printers.value(call.constructor))
    + ", arguments: [" + call.arguments.map(printers.value).join(",") + "]"
    + ", node: " + printers.node(call.node) + "}";
};
// Exports //
var stack = {};
stack.push = function (call) { console.log(printers.call(call)) };
stack.pop = function (result) { console.log("return: "+printers.value(result)) };
module.exports = Linvail(stack, wrap);
