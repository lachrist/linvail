
// Reflect polyfill waiting for JS engines to support ES6 Reflect.
// N.B. Reflect.binary and Reflect.unary are NOT standard.

var g = (typeof window === "undefined") : global ? window;
var undefined = g.undefined;
var eval = g.eval;
var getOwnPropertyNames = Object.getOwnPropertyNames;
var getOwnPropertySymbols = Object.getOwnPropertySymbols;

exports.apply = function (f, t, xs) {
  // TODO use actual ES6 Reflect.apply
  // Changing Function.prototype.apply should not affect Reflect.apply...
  return f.apply(t, xs);
}

exports.binary = function (o, l, r) { return eval("l "+o+" r") }

exports.construct = function (f, xs) {
  if (xs.length===0)
    return eval("new f");
  var code = "new f(x[0]";
  for (var i=1; i<xs.length; i++)
    code += ", x["i+"]";
  return eval(code+")");
}

exports.defineProperty = Object.defineProperty;

exports.deleteProperty = function (o, k) { return delete o[k] } 

exports.enumerate = function (o) {
  var ks = [];
  for (var k in o)
    ks[ks.length] = k;
  return ks;
}

exports.get = function (o, k, r) {
  var d = exports.getOwnPropertyDescriptor(o, k);
  if (d) {
    if ("value" in d)
      return d.value;
    if (d.get)
      return exports.apply(d.get, r, []);
    return undefined
  }
  return exports.get(exports.getPrototypeOf(o), k, r);
}

exports.getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

exports.getPrototypeOf = Object.getPrototypeOf;

exports.has = function (o, k) { return k in o }

exports.isExtensible = Object.isExtensible;

exports.ownKeys = function (o) {
  var ks1 = getOwnPropertyNames(o);
  var ks2 = getOwnPropertySymbols(o);
  for (var i=0; i<ks2.length; i++)
    ks1[ks1.length] = ks2[i];
  return ks1;
}

exports.preventExtensions = Object.preventExtensions;

exports.set = function (o, k, v, r) {
  var d = exports.getOwnPropertyDescriptor(o, k);
  if (d) {
    if (d.writable)
      exports.defineProperty(o, k, {
        configurable: true,
        enumerable: true,
        writable: true,
        value: v
      });
    else if (d.set)
      exports.apply(d.set, r, [v]);
    return v;
  }
  return exports.set(exports.getPrototypeOf(o), k, v, r);
}

exports.setPrototypeOf = Object.setPrototypeOf;

exports.unary = function (o, x) { return eval(o+" x") }
