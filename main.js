
var Membrane = require("./membrane.js");
var Internal = require("./internal.js");
var Aran = require("aran");

Reflect.unary = function (o, x) { return eval(o+" x") };
Reflect.binary = function (o, l, r) { return eval("l "+o+" r") };
Reflect.enumerate = function (o) {
  var ks = [];
  for (var k in o)
    ks.push(k);
  return ks;
};

module.exports = function (stack, wrap) {

  var membrane = Membrane(wrap);
  var internal = Internal(membrane.enter, membrane.leave);
  function internalize (x, i) {
    var p = internal(x);
    internals.set(p, x);
    return membrane.enter(p, aran.node(i));
  }
  var internals = new WeakMap();

  function get (o, k, r) {
    var b = internals.has(o);
    b && (o = internals.get(o));
    o = Object(o);
    var d = Reflect.getOwnPropertyDescriptor(o, k);
    if (!d) {
      var p = Reflect.getPrototypeOf(o);
      if (p)
        return get(membrane.leave(p, "prototype"), k, r);
    }
    if ("value" in d)
      return b ? d.value : membrane.enter(d.value, "result");
    if ("get" in d)
      return Reflect.apply(d.get, r, []);
    return membrane.enter(undefined, "result");
  }

  function initialize (o, k, v) {
    var b = internals.has(o);
    b && (o = internals.get(o));
    Reflect.defineProperty(o, k, {
      configurable: true,
      enumerable: true,
      writable: true,
      value: b ? v : membrane.leave(v, 2)
    });
  }

  function set (o, k, v, r) {
    var b = internals.has(o);
    b && (o = internals.get(o));
    o = Object(o);
    var d = Reflect.getOwnPropertyDescriptor(o, k);
    if (!d) {
      var p = Reflect.getPrototypeOf(o);
      p ? set(membrane.leave(p, "prototype"), k, v, r) : initialize(r, k, v);
    } else if ("value" in d && d.writable) {
      initialize(r, k, v);
    } else if ("set" in d) {
      Reflect.apply(d.set, r, [membrane.leave(v, 2)]);
    }
  }

  var traps = {};
  traps.primitive = function (x, i) { return membrane.enter(x, aran.node(i)) };
  traps.closure = internalize;
  traps.object = function (ds, i) {
    var o = {};
    ds.forEach(function (d) {
      ("get" in d) && (d.get = membrane.leave(d.get, aran.node(i)));
      ("set" in d) && (d.set = membrane.leave(d.set, aran.node(i))); 
      Object.defineProperty(o, d.key, d)
    });
    return internalize(o, i);
  };
  traps.array = internalize;
  traps.regexp = function (p, f, i) { return internalize(new RegExp(p, f), i) };
  traps.test = function (x, i) { return membrane.leave(x, aran.node(i)) };
  traps.eval = function (x, i) { return membrane.leave(x, aran.node(i)) };
  traps.with = function (x, i) { return membrane.leave(x, aran.node(i)) };
  traps.unary = function (o, x, i) {
    stack.push({function:Reflect.unary, arguments:[x], node:aran.node(i)});
    x = membrane.leave(x, 0);
    var r = membrane.enter(eval(o+" x"), "result");
    return (stack.pop(r), r);
  };
  traps.binary = function (o, l, r, i) {
    stack.push({function:Reflect.binary, arguments:[o,l,r], node:aran.node(i)});
    l = membrane.leave(l, 1);
    r = membrane.leave(r, 2);
    var r = membrane.enter(eval("l "+o+" r"), "result");
    return (stack.pop(r), r);
  };
  traps.apply = function (f, t, xs, i) {
    stack.push({function:f, this:t, arguments:xs, node:aran.node(i)});
    f = membrane.leave(f, "function");
    var r = (internals.has(f))
      ? Reflect.apply(internals.get(f), t, xs)
      : membrane.enter(Reflect.apply(f, membrane.leave(t, "this"), xs = xs.map(membrane.leave)), "result");
    return (stack.pop(r), r);
  };
  traps.construct = function (c, xs, i) {
    stack.push({constructor:c, arguments:xs, node:aran.node(i)});
    c = membrane.leave(c, "constructor");
    var r = (internals.has(c))
      ? Reflect.construct(internals.get(c), xs)
      : membrane.enter(Reflect.construct(c, xs.map(membrane.leave)), "result");
    return (stack.pop(r), r);
  };
  traps.get = function (o, k, i) {
    stack.push({function:Reflect.get, arguments:[o,k], node:aran.node(i)});
    o = membrane.leave(o, 0);
    var r = get(o, membrane.leave(k, 1), o);
    stack.pop(r);
    return r;
  };
  traps.set = function (o, k, v, i) {
    stack.push({function:Reflect.set, arguments:[o,k,v], node:aran.node(i)});
    o = membrane.leave(o, 0);
    set(o, membrane.leave(k, 1), v, o);
    return (stack.pop(v), v);
  };
  traps.delete = function (o, k, i) {
    stack.push({function:Reflect.deleteProperty, arguments:[o,k], node:aran.node(i)});
    o = membrane.leave(o, 0);
    k = membrane.leave(k, 1);
    var r = membrane.enter(delete o[k], "result");
    return (stack.pop(r), r);
  };
  traps.enumerate = function (o, i) {
    stack.push({function:Reflect.enumerate, arguments:[o], node:aran.node(i)});
    o = membrane.leave(o, 0);
    var ks = [];
    for (var k in o)
      ks.push(k);
    return (stack.pop(ks), ks);
  };

  global.__linvail__ = traps;
  var aran = Aran({traps:Object.keys(traps), namespace:"__linvail__", loc:true});
  return aran.instrument;

};
