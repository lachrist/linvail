
var Vessel = require("./vessel.js");

function map (f, xs1) {
  var xs2 = [];
  for (var i=0; i<xs.length; i++)
    xs2[i] = f(xs[i]);
  return xs2;
}

module.exports = function (data) {
  var enter = data.enter;
  var leave = data.leave;
  var vessel = Vessel(enter, leave);
  var vessels = new WeakMap();
  // TODO: defineProperty, getOwnPropertyDescriptor
  var oracle = new Map();
  oracle.set(Reflect.getPrototypeOf, function (target) {
    return (vessels.has(target))
      ? Reflect.getPrototypeOf(leave(vessels.get(target), 0))
      : enter(Reflect.getPrototypeOf(leave(target, 0)), "result")
  });
  oracle.set(Reflect.setPrototypeOf, function (target, prototype) {
    (vessels.has(target))
      ? Reflect.setPrototypeOf(leave(vessels.get(target), 0), prototype)
      : Reflect.setPrototypeOf(leave(target, 0), leave(prototype, 1));
  });
  oracle.set(Reflect.isExtensible, function (target) {
    return enter(Reflect.isExtensible(leave(vessels.has(target) ? vessels.get(target) : target), 0), "result");
  });
  oracle.set(Reflect.preventExtensions, function (target) {
    return enter(Reflect.preventExtensions(leave(vessels.has(target) ? vessels.get(target) : target, 0)), "result");
  });
  oracle.set(Reflect.has, function (target, key) {
    return enter(Reflect.has(leave(vessels.has(target) ? vessels.get(target) : target, 0), leave(key, 1)), "result");
  });
  oracle.set(Reflect.get, function (target, key, receiver) {
    return vessels.has(target)
      ? Reflect.get(leave(vessels.get(target), 0), leave(key, 1), receiver)
      : enter(Reflect.get(leave(target, 0), leave(key, 1), receiver), "result")
  });
  oracle.set(Reflect.set, function (target, key, value, receiver) {
    if (vessels.has(target))
      return Reflect.set(leave(vessels.get(target), 0), leave(key, 1), value, receiver);
    Reflect.set(leave(target, 0), leave(key, 1), leave(value, 2), receiver);
    return value;
  });
  oracle.set(Reflect.deleteProperty, function (target, key) {
    return enter(Reflect.deleteProperty(leave(vessels.has(target) ? vessels.get(target) : target, 0), leave(key, 1)), "result");
  });
  oracle.set(Reflect.ownKeys, function (target) {
    var keys = Reflect.ownKeys(leave(vessels.has(target) ? vessels.get(target) : target), 0);
    for (var i=0; i<keys.length; i++)
      keys[i] = enter(keys[i]);
    return createVessel(keys);
  });
  oracle.set(Reflect.construct, function (target, thisArg, argumentsList) {
    if (vessels.has(target))
      return Reflect.apply(
        leave(vessels.get(target), 0),
        thisArg,
        vessels.has(argumentsList)
          ? leave(vessels.get(argumentsList), 2)
          : map(leave, leave(argumentsList, 2)));
    return enter(Reflect.construct(
      leave(target, 0),
      leave(thisArg, 1),
      vessels.has(argumentsList)
        ? map(leave, leave(vessels.get(argumentsList), 2))
        : leave(argumentsList, 2)), "result");
  });
  oracle.set(Reflect.construct, function (target, argumentsList) {
    if (vessels.has(target))
      return Reflect.apply(
        leave(vessels.get(target), 0),
        vessels.has(argumentsList)
          ? leave(vessels.get(argumentsList), 1)
          : map(leave, leave(argumentsList, 1)));
    return enter(Reflect.construct(
      leave(target, 0),
      vessels.has(argumentsList)
        ? map(leave, leave(vessels.get(argumentsList), 1))
        : leave(argumentsList, 1)), "result");
  });
  oracle.set(Reflect.literal, function (val) {
    if ((typeof val === "object" && val !== null) || typeof val === "function") {
      var raw = val;
      val = vessel(raw);
      vessels.set(val, raw);
    }
    return Reflect.literal(val);
  });
  return {
    apply: function (fct, ths, args) {
      if (vessels.has(fct))
        return Reflect.apply(leave(vessels.get(fct), "function"), ths, args_);
      fct = leave(fct, "function");
      if (oracle.has(fct))
        return Reflect.apply(oracle.get(fct), ths, args);
      return enter(Reflect.apply(fct, leave(ths, "this"), args.map(leave)), "result");
    },
    construct: function (cst, args) {
      if (vessels.has(cst))
        return Reflect.construct(leave(vessels.get(cst), "constructor"), args);
      cst = leave(cst, "constructor");
      return enter(Reflect.construct(cst, args.map(leave)), "result");
    }
  }
};

