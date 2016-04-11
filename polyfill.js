  
module.exports = function () {
  var global = (function () { return this } ());
  var Reflect = global.Reflect;
  if (!global.Proxy)
    throw new Erro("Cannit find the Proxy API");
  if (!Reflect)
    throw new Error("Cannot find the Reflect API");
  if (!Reflect.unary)
    Reflect.unary = function unary (o, x) { return eval(o+" x") };
  if (!Reflect.binary)
    Reflect.binary = function binary (o, l, r) { return eval("l "+o+" r") };
  if (!Reflect.test)
    Reflect.test = function test (x) { return x };
  if (!Reflect.literal)
    Reflect.literal = function literal (x) { return x };
}
