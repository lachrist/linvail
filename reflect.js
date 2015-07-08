
// Reflect polyfill waiting for JS engines to support ES6 Reflect.
// N.B. Reflect.binary and Reflect.unary are NOT standard.
// Changing Function.prototype.apply will affect Reflect.apply *sigh*

var g = (typeof window === "undefined") ? global : window;
var undefined = g.undefined;
var eval = g.eval;
var defineProperty = Object.defineProperty;
var getOwnPropertyNames = Object.getOwnPropertyNames;
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var getPrototypeOf = Object.getPrototypeOf;

//////////////////
// global.Proxy //
//////////////////

if (!g.Proxy)
  throw new Error("Linvail requires ES6 proxies...");
var Proxy = g.Proxy;
var proxies = new WeakMap(); 
g.Proxy = function (target, handlers) {
  var p = new Proxy(target, handlers);
  proxies.set(p, {target:target, handlers:handlers});
  return p;
}

////////////////////
// global.Reflect //
////////////////////

if (!g.Reflect) {
  function apply (f, t, xs) {
    try {var r = f.apply(t, xs) }
    catch (e) {debugger}
    return r
  }
  g.Reflect = {
    apply: apply,
    construct: function (f, xs) {
      if (xs.length===0)
        return eval("new f");
      var code = "new f(x[0]";
      for (var i=1; i<xs.length; i++)
        code += ", x["+i+"]";
      return eval(code+")");
    },
    defineProperty: Object.defineProperty,
    deleteProperty: function (o, k) { return delete o[k] },
    enumerate: function (o) {
      var ks = [];
      for (var k in o)
        ks[ks.length] = k;
      return ks;
    },
    get: function get (o, k, r) {
      var d = getOwnPropertyDescriptor(o, k);
      if (d) {
        if ("value" in d)
          return d.value;
        if (d.get)
          return apply(d.get, r, []);
        return undefined
      }
      var proto = getPrototypeOf(o);
      var _proto = proxies.get(proto);
      if (_proto && _proto.handlers.get)
        return _proto.handlers.get(_proto.target, k, r);
      if (_proto)
        proto = _proto.target;
      return (proto === null) ? undefined : g.Reflect.get(proto, k, r);
    },
    getOwnPropertyDescriptor: Object.getOwnPropertyDescriptor,
    getPrototypeOf: Object.getPrototypeOf,
    has: function (o, k) { return k in o },
    isExtensible: Object.isExtensible,
    ownKeys: function (o) {
      var ks1 = getOwnPropertyNames(o);
      var ks2 = getOwnPropertySymbols(o);
      for (var i=0; i<ks2.length; i++)
        ks1[ks1.length] = ks2[i];
      return ks1;
    },
    preventExtensions: Object.preventExtensions,
    set: function (o, k, v, r) {
      var d = getOwnPropertyDescriptor(o, k);
      if (d) {
        if (d.writable)
          return g.Reflect.write(r, k, v);
        else if (d.set)
          apply(d.set, r, [v]);
        return v;
      }
      var proto = getPrototypeOf(o);
      var _proto = proxies.get(proto);
      if (_proto && _proto.handlers.set)
        return _proto.handlers.set(_proto.target, k, v, r);
      if (_proto)
        proto = _proto.target;
      if (proto === null)
        return g.Reflect.write(r, k, v);
      return g.Reflect.set(proto, k, v, r);
    },
    setPrototypeOf: Object.setPrototypeOf
  };
}

g.Reflect.unary = function (o, x) { return eval(o+" x") }
g.Reflect.binary = function (o, l, r) { return eval("l "+o+" r") }
g.Reflect.write = function (rec, key, val) {
  var des = Reflect.getOwnPropertyDescriptor(rec, key);
  if (!des)
    des = {configurable:true, enumerable:true, writable:true};
  des.value = val;
  Reflect.defineProperty(rec, key, des);
  return val;
}

//////////////////
// Transparency //
//////////////////

var constructors = [Function, Boolean, Number, String, Date];
constructors.forEach(function (F) {
  var toString = F.prototype.toString;
  var valueOf = F.prototype.valueOf;
  F.prototype.toString = function () { return toString.apply(proxies.has(this)?proxies.get(this).target:this) }
  F.prototype.valueOf = function () { return valueOf.apply(proxies.has(this)?proxies.get(this).target:this) }
});

// var functionToString = Function.prototype.toString;
// g.Function.prototype.toString = function () { return functionToString.apply(proxies.has(this)?proxies.get(this).target:this) }

// var dateToString = Date.prototype.toString;
// g.Date.prototype.toString = function () { debugger; return dateToString.apply(proxies.has(this)?proxies.get(this).target:this) }

var regexpTest = RegExp.prototype.test;
g.RegExp.prototype.test = function () { return regexpTest.apply(proxies.has(this)?proxies.get(this).target:this, arguments) }


