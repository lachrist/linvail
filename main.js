
var Internal = require("./internal.js");

module.exports = function (membrane) {

  var internal = Internal(membrane);
  var internals = new WeakMap();

  function internalize (x, i) {
    var p = internal(x);
    internals.set(p, x);
    return membrane.enter(p, i, "result");
  }

  function apply (f, t, xs, i) {
    f = membrane.leave(f, i, "function");
    if (internals.has(f))
      return Reflect.apply(internals.get(f), t, xs);
    t = membrane.leave(t, i, "this");
    for (var j=0, l=xs.length; j<l; j++)
      xs[j] = membrane.leave(xs[j], i, j);
    return membrane.enter(Reflect.apply(f, t, xs), i, "result");
  }

  function construct (c, xs, i) {
    c = membrane.leave(c, i, "constructor");
    if (internals.has(c))
      return Reflect.construct(internals.get(c), xs);
    for (var j=0, l=xs.length; j<l; j++)
      xs[j] = membrane.leave(xs[j], i, j);
    return membrane.enter(Reflect.construct(c, xs), i, "result");
  }

  function get (o, k, r, i) {
    var b = internals.has(o);
    b && (o = internals.get(o));
    o = Object(o);
    var d = Reflect.getOwnPropertyDescriptor(o, k);
    if (!d) {
      var p = Reflect.getPrototypeOf(o);
      return p ? get(membrane.leave(p, i, "prototype"), k, r, i) : membrane.enter(undefined, i, "result");
    }
    if ("value" in d)
      return b ? d.value : membrane.enter(d.value, i, "result");
    if ("get" in d)
      return apply(d.get, r, [], i);
    return membrane.enter(undefined, i, "result");
  }

  var set = (function () {
    function init (rr, k, v, i) {
      var b = internals.has(rr);
      b && (rr = internals.get(rr));
      Reflect.defineProperty(rr, k, {
        configurable: true,
        enumerable: true,
        writable: true,
        value: b ? v : membrane.leave(v, i, "value")
      });
    }
    return function (o, k, v, r, rr, i) {
      var b = internals.has(o);
      b && (o = internals.get(o));
      o = Object(o);
      var d = Reflect.getOwnPropertyDescriptor(o, k);
      if (!d) {
        var p = Reflect.getPrototypeOf(o);
        p ? set(membrane.leave(p, i, "prototype"), k, v, r, rr, i) : init(rr, k, v, i);
      } else if ("value" in d && d.writable) {
        init(rr, k, v, i);
      } else if ("set" in d) {
        apply(d.set, r, [v], i);
      }
    }
  } ());

  // We cannot proxified transparently RegExp:
  // > (new Proxy(/abc/, {})).test("abc")
  // TypeError: Method RegExp.prototype.test called on incompatible receiver [object Object]
  var traps = {};
  traps.primitive = internalize;
  traps.array = internalize;
  traps.function = internalize;
  traps.object = internalize;
  traps.test = function (x, i) { return membrane.leave(x, i, "test") };
  traps.with = function (o, i) { return membrane.leave(o, i, "with") };
  traps.eval = function (xs, i) { return membrane.leave(xs[0], i, "eval") };
  traps.unary = function (o, x, i) {
    switch (o) {
      case "-":      return membrane.enter(-      membrane.leave(x, i, "argument"), i, "result");
      case "+":      return membrane.enter(+      membrane.leave(x, i, "argument"), i, "result");
      case "!":      return membrane.enter(!      membrane.leave(x, i, "argument"), i, "result");
      case "~":      return membrane.enter(~      membrane.leave(x, i, "argument"), i, "result");
      case "typeof": return membrane.enter(typeof membrane.leave(x, i, "argument"), i, "result");
      case "void":   return membrane.enter(void   membrane.leave(x, i, "argument"), i, "result");
      case "delete": return membrane.enter(delete membrane.leave(x, i, "argument"), i, "result");
    }
    throw new Error("Unknwon unary operator: "+o);
  };
  traps.binary = function (o, l, r, i) {
    switch (o) {
      // Arithmetic
      case "+":          return membrane.enter(membrane.leave(l, i, "left") +          membrane.leave(r, i, "right"), i, "result");
      case "-":          return membrane.enter(membrane.leave(l, i, "left") -          membrane.leave(r, i, "right"), i, "result");
      case "*":          return membrane.enter(membrane.leave(l, i, "left") *          membrane.leave(r, i, "right"), i, "result");
      case "/":          return membrane.enter(membrane.leave(l, i, "left") /          membrane.leave(r, i, "right"), i, "result");
      // Comparison
      case "==":         return membrane.enter(membrane.leave(l, i, "left") ==         membrane.leave(r, i, "right"), i, "result");
      case "!=":         return membrane.enter(membrane.leave(l, i, "left") !=         membrane.leave(r, i, "right"), i, "result");
      case "===":        return membrane.enter(membrane.leave(l, i, "left") ===        membrane.leave(r, i, "right"), i, "result");
      case "!==":        return membrane.enter(membrane.leave(l, i, "left") !==        membrane.leave(r, i, "right"), i, "result");
      case "<":          return membrane.enter(membrane.leave(l, i, "left") <          membrane.leave(r, i, "right"), i, "result");
      case "<=":         return membrane.enter(membrane.leave(l, i, "left") <=         membrane.leave(r, i, "right"), i, "result");
      case ">":          return membrane.enter(membrane.leave(l, i, "left") >          membrane.leave(r, i, "right"), i, "result");
      case ">=":         return membrane.enter(membrane.leave(l, i, "left") >=         membrane.leave(r, i, "right"), i, "result");
      // Object
      case "in":         return membrane.enter(membrane.leave(l, i, "left") in         membrane.leave(r, i, "right"), i, "result");
      case "instanceof": return membrane.enter(membrane.leave(l, i, "left") instanceof membrane.leave(r, i, "right"), i, "result");
      // Bit
      case "<<":         return membrane.enter(membrane.leave(l, i, "left") <<         membrane.leave(r, i, "right"), i, "result");
      case ">>":         return membrane.enter(membrane.leave(l, i, "left") >>         membrane.leave(r, i, "right"), i, "result");
      case ">>>":        return membrane.enter(membrane.leave(l, i, "left") >>>        membrane.leave(r, i, "right"), i, "result");
      case "%":          return membrane.enter(membrane.leave(l, i, "left") %          membrane.leave(r, i, "right"), i, "result");
      case "|":          return membrane.enter(membrane.leave(l, i, "left") |          membrane.leave(r, i, "right"), i, "result");
      case "^":          return membrane.enter(membrane.leave(l, i, "left") ^          membrane.leave(r, i, "right"), i, "result");
      case "&":          return membrane.enter(membrane.leave(l, i, "left") &          membrane.leave(r, i, "right"), i, "result");
    }
    throw new Error("Unknwon binary operator: "+o);
  };
  traps.apply = apply;
  traps.construct = construct;
  traps.get = function (o, k, i) {
    return get(membrane.leave(o, i, "target"), membrane.leave(k, i, "key"), o, i);
  };
  traps.set = function (o, k, v, i) {
    var rr = membrane.leave(o, i, "target");
    set(rr, membrane.leave(k, i, "key"), v, o, rr, i);
    return v;
  };
  traps.delete = function (o, k, i) {
    return membrane.enter(delete membrane.leave(o, i, "target")[membrane.leave(k, i, "key")], i, "result");
  };
  traps.enumerate = function (o, i) {
    o = membrane.leave(o, i, "target");
    var ks = [];
    var length = 0;
    for (var k in o)
      ks[length++] = membrane.enter(k, i, "key");
    return ks;
  };

  return traps;

};
