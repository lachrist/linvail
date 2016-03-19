(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Linvail = require("../main.js");
var id = 0, calls = [];
calls.push = function (info) {
  info.NaNs = [];
  calls[length] = info;
};
function wrap (val) {
  if (val !== val) {
    console.log("NaN #" + (++id));
    console.dir(calls[calls.length - 1]);
    return {id:id, unwrap:unwrap};
  }
}
function unwrap () {
  calls[calls.length-1].NaNs.push(this.id);
  return NaN;
}
Linvail(calls, wrap);
},{"../main.js":4}],2:[function(require,module,exports){

var Search = require("./search.js");
var Oracle = require("./oracle.js");

module.exports = function (stack, data) {
  var oracle = Oracle(data);
  return {
    apply: function (fct, ths, args, loc) {
      loc.function = fct;
      loc.this = ths;
      loc.arguments = args;
      stack.push(loc);
      var res = oracle.apply(fct, ths, args);
      stack.pop(res);
      return res;
    },
    construct: function (cst, args, loc) {
      loc.constructor = cts;
      loc.arguments = args;
      stack.push(loc);
      var res = oracle.construct(cts, args);
      stack.pop(res);
      return res;
    }
  }
}

},{"./oracle.js":5,"./search.js":7}],3:[function(require,module,exports){

module.exports = function (wrap) {
  var wrappers = new WeakSet();
  return {
    enter: function (val, ctx) {
      var w = wrap(val, ctx);
      if (!w)
        return val;
      wrappers.add(w);
      return w;
    },
    leave: function (val, ctx) { return wrappers.has(val) ? val.unwrap(ctx) : val }
  }
}

},{}],4:[function(require,module,exports){

var Search = require("./search.js");
var Polyfill = require("./polyfill.js");
var Control = require("./control.js");
var Data = require("./data.js");
var Util = require("./util.js");

module.exports = function (stack, wrap) {
  Polyfill();
  var sources = {};
  var search = Search(sources);
  var control = Control(stack, Data(wrap));
  var Reflect = Util.copy((function () { return this } ()).Reflect);
  var eval = (function () { return this } ()).eval;
  (function () { return this } ()).aran = {
    Ast:        function (ast, url)             { sources[url] = ast },
    literal:    function (val, idx)             { return control.apply(Reflect.literal,        undefined, [val],                search(idx)) },
    unary:      function (op, arg, idx)         { return control.apply(Reflect.unary,          undefined, [op, arg],            search(idx)) },
    binary:     function (op, left, right, idx) { return control.apply(Reflect.binary,         undefined, [op, left, right],    search(idx)) },
    apply:      function (fct, ths, args, idx)  { return control.apply(fct,                    ths,       args,                 search(idx)) },
    construct:  function (cst, args, idx)       { return control.construct(cst,                           args,                 search(idx)) },
    eval:       function (args, idx)            { return control.apply(eval,                   undefined, args,                 search(idx)) },
    get:        function (obj, key, idx)        { return control.apply(Reflect.get,            undefined, [obj, key, obj],      search(idx)) },
    set:        function (obj, key, val, idx)   { return control.apply(Reflect.set,            undefined, [obj, key, val, obj], search(idx)) },
    delete:     function (obj, key, idx)        { return control.apply(Reflect.deleteProperty, undefined, [obj, key],           search(idx)) },
    enumerate:  function (obj, idx)             { return control.apply(Reflect.enumerate,      undefined, [obj],                search(idx)) },
    test:       function (val, idx)             { return control.apply(Reflect.test,           undefined, [val],                search(idx)) }
  };
};


},{"./control.js":2,"./data.js":3,"./polyfill.js":6,"./search.js":7,"./util.js":8}],5:[function(require,module,exports){

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


},{"./vessel.js":9}],6:[function(require,module,exports){
  
module.exports = function () {
  var global = (function () { return this } ());
  var Reflect = global.Reflect;
  if (!Reflect)
    throw new Error("Cannot find the Reflect objects");
  if (!Reflect.unary)
    Reflect.unary = function unary (o, x) { return eval(o+" x") };
  if (!Reflect.binary)
    Reflect.binary = function binary (o, l, r) { return eval("l "+o+" r") };
  if (!Reflect.test)
    Reflect.test = function test (x) { return x };
  if (!Reflect.literal)
    Reflect.literal = function literal (x) { return x };
}


},{}],7:[function(require,module,exports){

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

},{}],8:[function(require,module,exports){

exports.copy = function (obj1) {
  var obj2 = Object.create(obj1.__proto__);
  for (var key in obj1)
    obj2[key] = obj1[key];
  return obj2;
}

},{}],9:[function(require,module,exports){

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
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
aran.__eval__=aran.__eval__||eval;aran.__apply__=aran.__apply__||function(f,t,xs){return f.apply(t,xs)};aran.__defineProperties__=aran.__defineProperties__||Object.defineProperties;aran.Ast({"type":"Program","body":[{"type":"VariableDeclaration","declarations":[{"type":"VariableDeclarator","id":{"type":"Identifier","name":"x"},"init":{"type":"UnaryExpression","operator":"-","argument":{"type":"Literal","value":1,"raw":"1","bounds":[4,4]},"prefix":true,"bounds":[3,4]}}],"kind":"var","bounds":[2,4]},{"type":"VariableDeclaration","declarations":[{"type":"VariableDeclarator","id":{"type":"Identifier","name":"y"},"init":{"type":"CallExpression","callee":{"type":"MemberExpression","computed":false,"object":{"type":"Identifier","name":"Math","bounds":[7,7]},"property":{"type":"Identifier","name":"sqrt"}},"arguments":[{"type":"Identifier","name":"x","bounds":[8,8]}],"bounds":[6,8]}}],"kind":"var","bounds":[5,8]}],"sourceType":"script","bounds":[1,8]},"file:///Users/soft/Desktop/workspace/linvail/analyses/target.js");var aran1;var x=aran.unary("-",aran.literal(1,4),3);var y=aran.apply(aran.get((aran1=Math),"sqrt",6),aran1,[x],6);
},{}]},{},[1]);
