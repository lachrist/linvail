
var IFunction = require("./apply/irregular/function.js");
var IConstructor = require("./apply/irregular/constructor.js");
var Polyfill = require("./apply/polyfill.js");
var Util = require("./util.js");

module.exports = function (membrane, object) {

  function leave1 (arg, idx) { return membrane.leave(arg, "arguments["+idx+"]") }
  function leave2 (arg, idx) { return membrane.leave(arg, "arguments[1]["+idx+"]") }

  function apply (fct, ctx, args, info) {
    callstack.push(fct, ctx, args, info);
    fct = membrane.leave(fct, "function");
    fct = polyfill(fct) || fct;
    var res, raw = object.bypass(fct) || ifunction(fct);
    if (raw)
      res = Reflect.apply(raw, ctx, args);
    else
      res = membrane.enter(Reflect.apply(raw, membrane.leave(ctx, "this"), args.map(leave1)));
    callstack.pop(res);
    return res;
  }

  apply.irregular = function (fct, ctx, args, info) {
    callstack.push(fct, ctx, args, info);
    var res = Reflect.apply(ifunction(fct), ctx, args);  
    callstack.pop(res);
    return res;
  }

  apply.construct = function (cst, args, info) {
    callstack.push(Reflect.construct, null, [cst, args], info);
    var icst = iconstructor(cst);
    if (icst) {
      callstack.push(cst, null, args, "construct");
      var res = Reflect.construct(icst, args);
      callstack.pop(res);
    } else {
      var proto = apply.irregular(Reflect.get, null, [cst, "prototype", cst], "arguments[0].prototype");
      var ctx = object.register(Object.create(proto), "new");
      var res = apply(cst, ctx, args, "construct");
      if (Util.primitive(membrane.leave(res)))
        res = ctx;
    }
    callstack.pop(res);
    return res;
  }

  apply.initialize = function (aran) { polyfill = Polyfill(aran) }

  var iconstructor = IConstructor(membrane, object, apply);

  var ifunction = IFunction(membrane, object, apply);

  var polyfill = function () {};

  return apply;

};
