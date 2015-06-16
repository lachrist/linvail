
var Primitive = require("./primitive.js");

module.exports = function (oncomposite, callstack, membrane) {

  var proxies = new WeakMap();

  var handlers = {
    apply: function (fct, ctx, args) {
      callstack.apply(fct, ctx, args);
      ctx = membrane.enter(ctx, "this");
      for (var i=0; i<args.length; i++)
        args[i] = membrane.enter(args[0], "arguments["+i+"]");
      var res = membrane.leave(Reflect.apply(fct, ctx, args), "result");
      callstack.pop();
      return res;
    },
    construct: function (cst, args) {
      callstack.construct(cst, args);
      var proto = handlers.get(cst, "prototype", cst);
      var ctx = register(Object.create(proto), "this");
      for (var i=0; i<args.length; i++)
        args[i] = membrane.enter(args[0], "arguments["+i+"]");
      var res = membrane.leave(Reflect.apply(fct, ctx, args), "result");
      callstack.pop();
      return Primitive(res) ? ctx : res;
    },
    get: function (obj, key, rec) {
      var des = Reflect.getOwnPropertyDescriptor(obj);
      if (des) {
        if ("value" in des)
          return membrane.leave(des.value, "get");
        if (des.get)
          return Reflect.apply(des.get, rec, []);
        return undefined;
      }
      return Reflect.get(Reflect.getPrototypeOf(obj), key, rec);
    },
    set: function (obj, key, val, rec) {
      var des = Reflect.getOwnPropertyDescriptor(obj);
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
      return Reflect.set(Reflect.getPrototypeOf(obj), key, val, rec);
    },
    getOwnPropertyDescriptor: function (obj, key) {
      var des = Reflect.getOwnPropertyDescriptor(obj, key);
      des.value = primitive.leave(des.value, "getOwnPropertyDescriptor");
      return des;
    },
    defineProperty: function (obj, key, des) {
      des.value = primitive.enter(des.value, "defineProperty");
      return Reflect.defineProperty(obj, key, des);
    }
  }

  function bypass (val) { return proxies.get(val) }

  function register (val, info) {
    var p = new Proxy(oncomposite(val, info), handlers);
    proxies.set(p, val);
    return p;
  }

  return {bypass:bypass, register:register}

  // return {
  //   bypass:bypass,
  //   object: function (proto, info) { return register(intercept.object(proto, info) || Object.create(proto)) },
  //   array: function (info) { return register(intercept.array(info) || Array()) },
  //   arguments: function (info) { return register(intercept.arguments(info) || Arguments()) },
  //   error: function (msg, info) { return register(intercept.error(msg, info) || Error(msg)) },
  //   regexp: function (pattern, flags, info) { return register(intercept.regexp(pattern, flags, info) || RegExp(pattern, flags))}
  //   function: function (fct, info) { return register(intercept.function(fct, info) || fct) },
  // };

}
