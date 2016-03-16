
var IFunction = require("./apply/irregular/function.js");
var IConstructor = require("./apply/irregular/constructor.js");
// var Polyfill = require("./apply/polyfill.js");
var Util = require("./util.js");

module.exports = function (callstack, membrane, object) {

  function leave (arg, idx) { return membrane.leave(arg, "arguments["+idx+"]") }

  function apply (fct, ctx, args, info) {
    callstack.apply(fct, ctx, args, info);
    fct = membrane.leave(fct, "function");
    //fct = polyfill(fct) || fct;
    var res, raw = object.bypass(fct) || ifunction(fct);
    if (raw)
      res = Reflect.apply(raw, ctx, args);
    else
      res = membrane.enter(Reflect.apply(fct, membrane.leave(ctx, "this"), args.map(leave)), "result");
    return callstack.return(res);
  }

  apply.irregular = function (fct, ctx, args, info) {
    callstack.apply(fct, ctx, args, info);
    return callstack.return(Reflect.apply(ifunction(fct), ctx, args));
  }

  apply.construct = function (cst, args, info) {
    callstack.construct(cst, args, info);
    var icst = iconstructor(cst);
    if (icst)
      return callstack.return(Reflect.construct(icst, args));
    var res;
    var proto = apply.irregular(Reflect.get, null, [cst, "prototype", cst], "constructor.prototype");
    var ctx = object.register(Object.create(proto), "this");
    cst = membrane.leave(cst, "constructor");
    //cst = polyfill(cst) || cst;
    var raw = object.bypass(cst) || ifunction(cst);
    if (raw)
      res = Reflect.apply(raw, ctx, args);
    else
      res = membrane.enter(Reflect.apply(raw, ctx, args.map(leave)), "result");
    if (Util.primitive(membrane.leave(res, "result")))
      res = ctx;
    return callstack.return(res);
  }

  //apply.initialize = function (aran) { polyfill = Polyfill(aran) }

  var iconstructor = IConstructor(membrane, object, apply);

  var ifunction = IFunction(membrane, object, apply);

  //var polyfill = function () {};

  return apply;

};
