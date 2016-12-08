
var Internal = require("./internal.js");

module.exports = function (enter, leave) {

  var internal = Internal(enter, leave);
  var internals = new WeakMap();
  function internalize (x, i, s) {
    var p = internal(x);
    internals.set(p, x);
    return enter(p, i, s);
  }

  function apply (f, t, xs, i) {
    f = leave(f, i, "function");
    if (internals.has(f))
      return Reflect.apply(internals.get(f), t, xs);
    t = leave(t, i, "this");
    for (var j=0, l=xs.length; j<l; j++)
      xs[j] = leave(xs[j], i, j);
    return enter(Reflect.apply(f, t, xs), i, "result");
  }

  function construct (c, xs, i) {
    c = leave(c, i, "constructor");
    if (internals.has(c))
      return Reflect.construct(internals.get(c), xs);
    for (var j=0, l=xs.length; j<l; j++)
      xs[j] = leave(xs[j], i, j);
    return enter(Reflect.construct(f, xs), i, "result");
  }

  function get (o, k, r, i) {
    var b = internals.has(o);
    b && (o = internals.get(o));
    o = Object(o);
    var d = Reflect.getOwnPropertyDescriptor(o, k);
    if (!d) {
      var p = Reflect.getPrototypeOf(o);
      return p ? get(leave(p, i, "prototype"), k, r, i) : enter(undefined, i, "result");
    }
    if ("value" in d)
      return b ? d.value : enter(d.value, i, "result");
    if ("get" in d)
      return apply(d.get, r, [], i);
    return enter(undefined, i, "result");
  }

  var set = (function () {
    function init (rr, k, v, i) {
      var b = internals.has(rr);
      b && (rr = internals.get(rr));
      Reflect.defineProperty(rr, k, {
        configurable: true,
        enumerable: true,
        writable: true,
        value: b ? v : leave(v, i, "value")
      });
    }
    return function (o, k, v, r, rr, i) {
      var b = internals.has(o);
      b && (o = internals.get(o));
      o = Object(o);
      var d = Reflect.getOwnPropertyDescriptor(o, k);
      if (!d) {
        var p = Reflect.getPrototypeOf(o);
        p ? set(leave(p, i, "prototype"), k, v, r, rr, i) : init(rr, k, v, i);
      } else if ("value" in d && d.writable) {
        init(rr, k, v, i);
      } else if ("set" in d) {
        apply(d.set, r, [v], i);
      }
    }
  } ());

  var traps = {};
  traps.primitive = function (x, i) { return enter(x, i, "primitive") };
  traps.array = function (xs, i) { return internalize(xs, i, "array") };
  traps.closure = function (f, i) { return internalize(f, i, "closure") };
  // We cannot proxified transparently RegExp:
  // > (new Proxy(/abc/, {})).test("abc")
  // TypeError: Method RegExp.prototype.test called on incompatible receiver [object Object]
  traps.regexp = function (p, f, i) { return new RegExp(p, f), i, "regexp" };
  traps.object = function (ds, i) {
    var o = {};
    ds.forEach(function (d) {
      ("get" in d) && (d.get = leave(d.get, i));
      ("set" in d) && (d.set = leave(d.set, i)); 
      Object.defineProperty(o, d.key, d)
    });
    return internalize(o, i, "object");
  };
  traps.test = function (x, i) { return leave(x, i, "test") };
  traps.with = function (o, i) { return leave(o, i, "with") };
  traps.eval = function (xs, i) { return leave(xs[0], i, "eval") };
  traps.unary = function (o, x, i) {
    switch (o) {
      case "-":      return enter(-      leave(x, i, "argument"), i, "result");
      case "+":      return enter(+      leave(x, i, "argument"), i, "result");
      case "!":      return enter(!      leave(x, i, "argument"), i, "result");
      case "~":      return enter(~      leave(x, i, "argument"), i, "result");
      case "typeof": return enter(typeof leave(x, i, "argument"), i, "result");
      case "void":   return enter(void   leave(x, i, "argument"), i, "result");
      case "delete": return enter(delete leave(x, i, "argument"), i, "result");
    }
    throw new Error("Unknwon unary operator: "+o);
  };
  traps.binary = function (o, l, r, i) {
    switch (o) {
      // Arithmetic
      case "+":          return enter(leave(l, i, "left") +          leave(r, i, "right"), i, "result");
      case "-":          return enter(leave(l, i, "left") -          leave(r, i, "right"), i, "result");
      case "*":          return enter(leave(l, i, "left") *          leave(r, i, "right"), i, "result");
      case "/":          return enter(leave(l, i, "left") /          leave(r, i, "right"), i, "result");
      // Comparison
      case "==":         return enter(leave(l, i, "left") ==         leave(r, i, "right"), i, "result");
      case "!=":         return enter(leave(l, i, "left") !=         leave(r, i, "right"), i, "result");
      case "===":        return enter(leave(l, i, "left") ===        leave(r, i, "right"), i, "result");
      case "!==":        return enter(leave(l, i, "left") !==        leave(r, i, "right"), i, "result");
      case "<":          return enter(leave(l, i, "left") <          leave(r, i, "right"), i, "result");
      case "<=":         return enter(leave(l, i, "left") <=         leave(r, i, "right"), i, "result");
      case ">":          return enter(leave(l, i, "left") >          leave(r, i, "right"), i, "result");
      case ">=":         return enter(leave(l, i, "left") >=         leave(r, i, "right"), i, "result");
      // Object
      case "in":         return enter(leave(l, i, "left") in         leave(r, i, "right"), i, "result");
      case "instanceof": return enter(leave(l, i, "left") instanceof leave(r, i, "right"), i, "result");
      // Bit
      case "<<":         return enter(leave(l, i, "left") <<         leave(r, i, "right"), i, "result");
      case ">>":         return enter(leave(l, i, "left") >>         leave(r, i, "right"), i, "result");
      case ">>>":        return enter(leave(l, i, "left") >>>        leave(r, i, "right"), i, "result");
      case "%":          return enter(leave(l, i, "left") %          leave(r, i, "right"), i, "result");
      case "|":          return enter(leave(l, i, "left") |          leave(r, i, "right"), i, "result");
      case "^":          return enter(leave(l, i, "left") ^          leave(r, i, "right"), i, "result");
      case "&":          return enter(leave(l, i, "left") &          leave(r, i, "right"), i, "result");
    }
    throw new Error("Unknwon binary operator: "+o);
  };
  traps.apply = apply;
  traps.construct = construct;
  traps.get = function (o, k, i) {
    return get(leave(o, i, "target"), leave(k, i, "key"), o, i);
  };
  traps.set = function (o, k, v, i) {
    var rr = leave(o, i, "target");
    set(rr, leave(k, i, "key"), v, o, rr, i);
    return v;
  };
  traps.delete = function (o, k, i) {
    return enter(delete leave(o, i, "target")[leave(k, i, "key")], i, "result");
  };
  traps.enumerate = function (o, i) {
    o = leave(o, i, "target");
    var ks = [];
    var length = 0;
    for (var k in o)
      ks[length++] = enter(k, i, "key");
    return ks;
  };

  return traps;

};
