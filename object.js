
var Util = require("./util.js");

module.exports = function (onobject, callstack, membrane) {

  var proxies = new WeakMap();

  var handlers = {
    apply: function (fct, ctx, args) {
      callstack.apply(fct, ctx, args, null);
      ctx = membrane.enter(ctx, "this");
      for (var i=0; i<args.length; i++)
        args[i] = membrane.enter(args[0], "arguments["+i+"]");
      return callstack.return(membrane.leave(Reflect.apply(fct, ctx, args), "result"));
    },
    construct: function (cst, args) {
      callstack.construct(cst, args, null);
      var proto = handlers.get(cst, "prototype", cst);
      var ctx = register(Object.create(proto), "this");
      for (var i=0; i<args.length; i++)
        args[i] = membrane.enter(args[0], "arguments["+i+"]");
      var res = membrane.leave(Reflect.apply(cst, ctx, args), "result");
      return callstack.return(Util.primitive(res) ? ctx : res);
    },
    get: function (obj, key, rec) {
      var des = Reflect.getOwnPropertyDescriptor(obj, key);
      if (des) {
        if ("value" in des)
          return membrane.leave(des.value, "get");
        if (des.get)
          return Reflect.apply(des.get, rec, []);
        return undefined;
      }
      var proto = Reflect.getPrototypeOf(obj);
      if (proto === null)
        return undefined;
      return Reflect.get(proto, key, rec);
    },
    set: function (obj, key, val, rec) {
      var des = Reflect.getOwnPropertyDescriptor(obj, key);
      if (des) {
        if (des.writable)
          Reflect.defineProperty(rec, key, {
            configurable: true,
            enumerable: true,
            writable: true,
            value: val
          });
        else if (des.set)
          Reflect.apply(des.set, rec, [val]);
        return val;
      }
      var proto = Reflect.getPrototypeOf(obj);
      if (proto === null)
        return val;
      return Reflect.set(proto, key, val, rec);
    },
    getOwnPropertyDescriptor: function (obj, key) {
      var des = Reflect.getOwnPropertyDescriptor(obj, key);
      if (des)
        des.value = membrane.leave(des.value, "getOwnPropertyDescriptor");
      return des;
    },
    defineProperty: function (obj, key, des) {
      des.value = membrane.enter(des.value, "defineProperty");
      return Reflect.defineProperty(obj, key, des);
    }
  }

  function bypass (val) { return proxies.get(val) }

  function register (val, info) {
    var p = new Proxy(val, handlers);
    proxies.set(p, val);
    onobject(p, info);
    return p;
  }

  return {bypass:bypass, register:register}

}
