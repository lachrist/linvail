
// Reflect polyfill waiting for JS engines to support ES6 Reflect.
// N.B. Reflect.binary and Reflect.unary are NOT standard.

var g = (typeof window === "undefined") ? global : window;
var undefined = g.undefined;
var eval = g.eval;
var defineProperty = Object.defineProperty;
var getOwnPropertyNames = Object.getOwnPropertyNames;
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var getPrototypeOf = Object.getPrototypeOf;

// Changing Function.prototype.apply will affect Reflect.apply *sigh*
function apply (f, t, xs) { return f.apply(t, xs) }

function get (o, k, r) {
  var d = getOwnPropertyDescriptor(o, k);
  if (d) {
    if ("value" in d)
      return d.value;
    if (d.get)
      return apply(d.get, r, []);
    return undefined
  }
  return get(getPrototypeOf(o), k, r);
}

function set(o, k, v, r) {
  var d = getOwnPropertyDescriptor(o, k);
  if (d) {
    if (d.writable)
      defineProperty(o, k, {
        configurable: true,
        enumerable: true,
        writable: true,
        value: v
      });
    else if (d.set)
      apply(d.set, r, [v]);
    return v;
  }
  return set(getPrototypeOf(o), k, v, r);
}

if (!g.Reflect)
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
    get: get,
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
    set: set,
    setPrototypeOf: Object.setPrototypeOf
  };

g.Reflect.unary = function (o, x) { return eval(o+" x") }

g.Reflect.binary = function (o, l, r) { return eval("l "+o+" r") }
