
var Membrane = require("./membrane.js");
var Internal = require("./internal.js");
var Aran = require("aran");

module.exports = function (stack, wrap) {

  var membrane = Membrane(wrap);
  var internal = Internal(membrane.enter, membrane.leave);
  var internals = new WeakMap();

  function get (o, k, r) {
    var b = internals.has(o);
    b && (o = internals.get(o));
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
      value: b ? v : membrane.leave(v, "value")
    });
  }

  function set (o, k, v, r) {
    var b = internals.has(o);
    b && (o = internals.get(o));
    var d = Reflect.getOwnPropertyDescriptor(o, k);
    if (!d) {
      var p = Reflect.getPrototypeOf(o);
      p ? set(membrane.leave(p, "prototype"), k, v, r) : initialize(r, k, v);
    } else if ("value" in d && d.writable) {
      initialize(r, k, v);
    } else if ("set" in d) {
      Reflect.apply(d.set, r, [membrane.leave("value")]);
    }
  }

  var traps = {};
  traps.literal = function (x, i) {
    if (x && typeof x === "object" || typeof x === "function") {
      var x2 = internal(x);
      internals.set(x2, x);
      x = x2;
    }
    return membrane.enter(x, aran.node(i));
  };
  traps.test = function (x, i) {
    return membrane.leave(x, aran.node(i));
  };
  traps.unary = function (o, x, i) {
    stack.push(aran.node(i))
    x = membrane.leave(x, "argument");
    var r = membrane.enter(eval(o+" x"), "result");
    return (stack.pop(), r);
  };
  traps.binary = function (o, l, r, i) {
    stack.push(aran.node(i));
    l = membrane.leave(l, "left");
    r = membrane.leave(r, "right");
    var r = membrane.enter(eval("l "+o+" r"), "result");
    return (stack.pop(), r);
  };
  traps.apply = function (f, t, xs, i) {
    stack.push(aran.node(i));
    f = membrane.leave(f, "function");
    var r = (internals.has(f))
      ? Reflect.apply(internals.get(f), t, xs)
      : membrane.enter(Reflect.apply(f, membrane.leave(t, "this"), xs = xs.map(membrane.leave)), "result");
    return (stack.pop(), r);
  };
  traps.construct = function (c, xs, i) {
    stack.push(aran.node(i));
    c = membrane.leave(c, "constructor");
    var r = (internals.has(c))
      ? Reflect.construct(internals.get(c), xs)
      : membrane.enter(Reflect.construct(c, xs.map(membrane.leave)), "result");
    return (stack.pop(), r);
  };
  traps.get = function (o, k, i) {
    stack.push(aran.node(i))
    o = membrane.leave(o, "object");
    var r = get(o, membrane.leave(k, "key"), o);
    stack.pop();
    return r;
  };
  traps.set = function (o, k, v, i) {
    stack.push(aran.node(i))
    o = membrane.leave(o, "object");
    set(o, membrane.leave(k, "key"), v, o);
    return (stack.pop(), v);
  };
  traps.delete = function (o, k, i) {
    stack.push(aran.node(i));
    o = membrane.leave(o, "object");
    k = membrane.leave(k, "key");
    var r = Reflect.deleteProperty(o, k);
    return (stack.pop(), r);
  };
  traps.enumerate = function (o, i) {
    stack.push(aran.node(i));
    o = membrane.leave(o, "object");
    k = membrane.leave(k, "key");
    var r = Reflect.deleteProperty(o, k);
    return (stack.pop(), r);
  } 

  global.__linvail__ = traps;
  var aran = Aran({traps:Object.keys(traps), namespace:"__linvail__", loc:true});
  return aran.instrument;

};
