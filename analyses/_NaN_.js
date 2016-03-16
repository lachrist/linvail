(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

var Linvail = require("../main.js");
var calls = [];
var id = 0;
calls.push = function (info) {
  info.NaNs = [];
  calls[length] = info;
};
function wrap (val, ctx) {
  if (val !== val) {
    var wrapper = {id:++id, unwrap:unwrap, toString:toString};
    var call = calls[calls.length - 1];
    var log  = wrapper + " appeared";
    if (call.node)
      log += " at " + JSON.stringify(call.node.loc.start);
    log += " while applying " + call.function.name;
    if (call.NaNs.length)
      log += " and involved NaNs: " + call.NaNs;
    console.log(log);
    return wrapper;
  }
}
function toString () { return "NaN-" + this.id }
function unwrap (ctx) {
  calls[calls.length-1].NaNs.push(this);
  return NaN;
}
Linvail(calls, wrap);

},{"../main.js":2}],2:[function(require,module,exports){

var Search = require("./search.js");
var Oracle = require("./oracle.js");

module.exports = function (calls, wrap) {
  var global = (function () { return this } ());
  if (!global.Reflect)
    throw new Error("Cannot find the Reflect objects");
  global.Reflect.unary = function (o, x) { return eval(o+" x") };
  global.Reflect.binary = function (o, l, r) { return eval("l "+o+" r") };
  global.Reflect.test = function (x) { return x };
  global.Reflect.literal = function (x) { return x };
  var sources = {};
  var search = Search(sources);
  var wrappers = new WeakSet();
  function enter (val, ctx) {
    var w = wrap(val, ctx);
    if (!w)
      return val;
    wrappers.add(w);
    return w;
  }
  function leave (val, ctx) { return wrappers.has(val) ? val.unwrap(ctx) : val }
  var oracle = Oracle(enter, leave);
  function apply (fct, ths, args, idx) {
    var info = search(idx) || {};
    info.function = fct;
    info.this = ths;
    info.arguments = args;
    calls.push(info);
    var res = oracle.apply(fct, ths, args);
    calls.pop(res);
    return res;
  }
  function construct (cst, args, idx) {
    var info = search(idx) || {};
    info.constructor = cts;
    info.arguments = args;
    calls.push(info);
    var res = oracle.construct(cts, args);
    calls.pop(res);
    return res;
  }
  var linvail = {};
  linvail.Ast       = function (ast, url)             { sources[url] = ast };
  linvail.literal   = function (val, idx)             { return apply(Reflect.literal,        undefined, [val],                idx) };
  linvail.unary     = function (op, arg, idx)         { return apply(Reflect.unary,          undefined, [op, arg],            idx) };
  linvail.binary    = function (op, left, right, idx) { return apply(Reflect.binary,         undefined, [op, left, right],    idx) };
  linvail.apply     = function (fct, ths, args, idx)  { return apply(fct,                    ths,       args,                 idx) };
  linvail.construct = function (cst, args, idx)       { return construct(cst,                           args,                 idx) };
  linvail.eval      = function (args, idx)            { return apply(global.eval,            undefined, args,                 idx) };
  linvail.get       = function (obj, key, idx)        { return apply(Reflect.get,            undefined, [obj, key, obj],      idx) };
  linvail.set       = function (obj, key, val, idx)   { return apply(Reflect.set,            undefined, [obj, key, val, obj], idx) };
  linvail.delete    = function (obj, key, idx)        { return apply(Reflect.deleteProperty, undefined, [obj, key],           idx) };
  linvail.enumerate = function (obj, idx)             { return apply(Reflect.enumerate,      undefined, [obj],                idx) };
  linvail.test      = function (val, idx)             { return apply(Reflect.test,           undefined, [val],                idx) };
  global.aran = linvail;
};

},{"./oracle.js":3,"./search.js":4}],3:[function(require,module,exports){

var Vessel = require("./vessel.js");

function map (f, xs1) {
  var xs2 = [];
  for (var i=0; i<xs.length; i++)
    xs2[i] = f(xs[i]);
  return xs2;
}

module.exports = function (enter, leave) {
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


},{"./vessel.js":5}],4:[function(require,module,exports){

module.exports = function (sources) {
  return function (idx) {
    for (url in  sources) {
      var n = search(sources[url], idx)
      if (n)
        return {url:url, top:sources[url], node:n};
    }
  }
}

function search (ast, idx) {
  var tmp;
  if (typeof ast !== "object" || ast === null)
    return;
  if (ast.bounds && idx === ast.bounds[0])
    return ast;
  if (ast.bounds && (idx < ast.bounds[0] || idx > ast.bounds[1]))
    return;
  for (var k in ast)
    if (tmp = search(ast[k], idx))
      return tmp;
}

},{}],5:[function(require,module,exports){

module.exports = function (leave, enter) {
  var traps = {
    getPrototypeOf: function (target) { return leave(Reflect.getPrototypeOf(leave(target))) },
    setPrototypeOf: function (target, prototype) { leave(Reflect.setPrototypeOf(leave(target), enter(prototype))) },
    isExtensible: function (target) { return Reflect.isExtensible(leave(target)) },
    preventExtensions: function (target) { return Reflect.preventExtensions(leave(target)) },
    getOwnPropertydescriptor: function (target, key) {
      var descriptor = Reflect.getOwnPropertydescriptor(leave(target), key);
      if ("value" in descriptor)
        descriptor.value = leave(descriptor.value);
      if ("get" in descriptor)
        descriptor.get = leave(descriptor.get);
      if ("set" in descriptor)
        descriptor.set = leave(descriptor.set);
      return descriptor;
    },
    defineProperty: function (target, key, descriptor) {
      if ("value" in descriptor)
        descriptor.value = enter(descriptor.value);
      if ("get" in descriptor)
        descriptor.get = enter(descriptor.get);
      if ("set" in descriptor)
        descriptor.set = enter(descriptor.set);
      return Reflect.defineProperty(leave(target), key, descriptor);
    },
    has: function (target, key) { return Reflect.has(leave(target), key) },
    get: function (target, key, receiver) { return leave(Reflect.get(leave(target), key, receiver)) },
    set: function (target, key, value, receiver) {
      Reflect.set(leave(target), key, enter(value), receiver);
      return value;
    },
    deleteProperty: function (target, key) { return Reflect.deleteProperty(leave(target), key) },
    ownKeys: function (target) { return Reflect.ownKeys(leave(target)) },
    apply: function (target, thisArg, argumentsList) {
      for (var i=0; i<argumentsList.length; i++)
        argumentsList[i] = enter(argumentsList[i]);
      return leave(Reflect.apply(leave(target), enter(thisArg), argumentsList));
    },
    construct: function (target, argumentsList) {
      for (var i=0; i<argumentsList.length; i++)
        argumentsList[i] = enter(argumentsList[i]);
      return leave(Reflect.construct(leave(target), argumentsList));
    }
  };
  return function (object) { return new Proxy(object, traps) };
};

},{}]},{},[1]);
