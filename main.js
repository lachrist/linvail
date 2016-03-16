
var Search = require("./search.js");
var Oracle = require("./oracle.js");

module.exports = function (calls, wrap) {
  var global = (function () { return this } ());
  if (!global.Reflect)
    throw new Error("Cannot find the Reflect objects");
  global.Reflect.unary = function unary (o, x) { return eval(o+" x") };
  global.Reflect.binary = function binary (o, l, r) { return eval("l "+o+" r") };
  global.Reflect.test = function test (x) { return x };
  global.Reflect.literal = function literal (x) { return x };
  var sources = {};
  var search = Search(sources);
  var wrappers = new WeakSet();
  function enter (val, ctx) {
    var w = wrap(val, ctx);
    if (!w)
      return val;
    wrappers.add(w);
    return w;
  }
  function leave (val, ctx) { return wrappers.has(val) ? val.unwrap(ctx) : val }
  var oracle = Oracle(enter, leave);
  function apply (fct, ths, args, idx) {
    var info = search(idx) || {};
    info.function = fct;
    info.this = ths;
    info.arguments = args;
    calls.push(info);
    var res = oracle.apply(fct, ths, args);
    calls.pop(res);
    return res;
  }
  function construct (cst, args, idx) {
    var info = search(idx) || {};
    info.constructor = cts;
    info.arguments = args;
    calls.push(info);
    var res = oracle.construct(cts, args);
    calls.pop(res);
    return res;
  }
  var linvail = {};
  linvail.Ast       = function (ast, url)             { sources[url] = ast };
  linvail.literal   = function (val, idx)             { return apply(Reflect.literal,        undefined, [val],                idx) };
  linvail.unary     = function (op, arg, idx)         { return apply(Reflect.unary,          undefined, [op, arg],            idx) };
  linvail.binary    = function (op, left, right, idx) { return apply(Reflect.binary,         undefined, [op, left, right],    idx) };
  linvail.apply     = function (fct, ths, args, idx)  { return apply(fct,                    ths,       args,                 idx) };
  linvail.construct = function (cst, args, idx)       { return construct(cst,                           args,                 idx) };
  linvail.eval      = function (args, idx)            { return apply(global.eval,            undefined, args,                 idx) };
  linvail.get       = function (obj, key, idx)        { return apply(Reflect.get,            undefined, [obj, key, obj],      idx) };
  linvail.set       = function (obj, key, val, idx)   { return apply(Reflect.set,            undefined, [obj, key, val, obj], idx) };
  linvail.delete    = function (obj, key, idx)        { return apply(Reflect.deleteProperty, undefined, [obj, key],           idx) };
  linvail.enumerate = function (obj, idx)             { return apply(Reflect.enumerate,      undefined, [obj],                idx) };
  linvail.test      = function (val, idx)             { return apply(Reflect.test,           undefined, [val],                idx) };
  global.aran = linvail;
};
