
var Linvail = require("linvail");
// Wrapper //
var wrappers = new WeakSet();
var counter = 0;
function wrap (x, ctx) {
  var w = {inner:x, unwrap:unwrap, id:++counter};
  wrappers.add(w);
  console.log("wrap "+printers.raw(x)+" into "+printers.wrapper(w)+" ("+printers.context(ctx)+")");
  return w;
}
function unwrap (ctx) {
  console.log("unwrap "+printers.wrapper(this)+" ("+printers.context(ctx)+")");
  return this.inner;
}
// Printers //
var printers = {};
printers.node = function (node) { return node.type + "@" + node.loc.start.line + ":" + node.loc.start.column };
printers.context = function (ctx) { return (ctx && typeof ctx === "object" && "type" in ctx) ? printers.node(ctx) : String(ctx) }
printers.wrapper = function (x) { return wrappers.has(x) && "#"+x.id };
printers.raw = function (x) {
  if ([null, undefined, true, false].indexOf(x) !== -1 || typeof x === "number")
    return x;
  if (typeof x === "string")
    return JSON.stringify(x);
  return Object.prototype.toString.apply(x);
};
printers.value = function (x) { return printers.wrapper(x) || printers.raw(x) };
printers.call = function (call) {
  return "{" + (("function" in call) ? "function:"+printers.value(call.function) : "constructor:"+printers.value(call.constructor))
    + ", arguments: [" + call.arguments.map(printers.value).join(",") + "]"
    + ", node: " + printers.node(call.node) + "}";
};
// Exports //
var stack = {};
stack.push = function (call) { console.log(printers.call(call)) };
stack.pop = function (result) { console.log("return: "+printers.value(result)) };
module.exports = Linvail(stack, wrap);
