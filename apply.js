
var Reflect = require("./reflect.js");
var IFunction = require("./apply/irregular/function.js");
var IConstructor = require("./apply/irregular/constructor.js");
var Polyfill = require("./apply/polyfill.js");
var Util = require("./util.js");

modules.exports = function (membrane, composite, aran) {

  function leave1 (arg, idx) { return membrane.leave(arg, "arguments["+idx+"]") }
  function leave2 (arg, idx) { return membrane.leave(arg, "arguments[1]["+idx+"]") }

  function apply (fct, ctx, args, info) {
    callstack.push(fct, ctx, args, info);
    fct = membrane.leave(fct, "function");
    fct = polyfill(fct) || fct;
    var res, raw = composite.bypass(fct) || ifunction(fct);
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
    cst = membrane.leave(cst, "arguments[0]");
    var res, raw = iconstructor(cst);
    if (raw)
      res = Reflect.apply(cst, null, args);
    else {
      cst = polyfill(cst) || cst;
      raw = composite.bypass(cst) || ifunction(fct);
      if (raw) {
        var proto = apply.irregular(Reflect.get, null, [cst, "prototype", cst], "arguments[0].prototype");
        var ctx = composite.register(Object.create(proto), "new"), Object.create(proto));
        res = membrane.leave(apply(cst, ctx, args, "construct"), "construct");
        res = Util.primitive(res) ? ctx : res;
      }
      else
        res = Reflect.construct(cst, args.map(leave2));
    }
    callstack.pop(res);
    return res;
  }

  var iconstructor = IConstructor(membrane, composite, apply);

  var ifunction = IFunction(membrane, composite, apply);

  var polyfill = Polyfill(aran);

  return apply;

};
