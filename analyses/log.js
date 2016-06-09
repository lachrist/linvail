
var Linvail = require("linvail");
var stack = {};
stack.push = function (x) { console.log(x) };
stack.pop = function (x) { console.log("pop") };
var counter = 0;
var printers = {};
printers.context = function (ctx) {
  if (typeof ctx === "string")
    return ctx;
  if (ctx && ctx.type)
    return ctx.type + "@" + ctx.loc.start.line + ":" + ctx.loc.start.column;
  return "";
};
printers.value = function (x) {
  if (typeof x === "string")
    return JSON.stringify(x);
  if (typeof x === "boolean" || typeof x === "number")
    return String(x);
  if (typeof x === "function")
    return "[function]";
  if (Array.isArray(x))
    return "[array]";
  if (x instanceof RegExp)
    return "[regexp]";
  return "[object]";
};
function wrap (x, ctx) {
  counter++;
  console.log("wrap "+printers.context(ctx)+" "+printers.value(x)+" into #"+counter);
  return {inner:x, unwrap:unwrap, id:counter};
}
function unwrap (ctx) {
  console.log("unwrap "+printers.context(ctx)+" #"+this.id);
  return this.inner;
}
module.exports = Linvail(stack, wrap);
