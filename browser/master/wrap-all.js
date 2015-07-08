require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

var IFunction = require("./apply/irregular/function.js");
var IConstructor = require("./apply/irregular/constructor.js");
var Polyfill = require("./apply/polyfill.js");
var Util = require("./util.js");

module.exports = function (callstack, membrane, object) {

  function leave (arg, idx) { return membrane.leave(arg, "arguments["+idx+"]") }

  function apply (fct, ctx, args, info) {
    callstack.apply(fct, ctx, args, info);
    fct = membrane.leave(fct, "function");
    fct = polyfill(fct) || fct;
    var res, raw = object.bypass(fct) || ifunction(fct);
    if (raw)
      res = Reflect.apply(raw, ctx, args);
    else
      res = membrane.enter(Reflect.apply(fct, membrane.leave(ctx, "this"), args.map(leave)), "result");
    return callstack.return(res);
  }

  apply.irregular = function (fct, ctx, args, info) {
    callstack.apply(fct, ctx, args, info);
    return callstack.return(Reflect.apply(ifunction(fct), ctx, args));
  }

  apply.construct = function (cst, args, info) {
    callstack.construct(cst, args, info);
    var icst = iconstructor(cst);
    if (icst)
      return callstack.return(Reflect.construct(icst, args));
    var res;
    var proto = apply.irregular(Reflect.get, null, [cst, "prototype", cst], "constructor.prototype");
    var ctx = object.register(Object.create(proto), "this");
    cst = membrane.leave(cst, "constructor");
    cst = polyfill(cst) || cst;
    var raw = object.bypass(cst) || ifunction(cst);
    if (raw)
      res = Reflect.apply(raw, ctx, args);
    else
      res = membrane.enter(Reflect.apply(raw, ctx, args.map(leave)), "result");
    if (Util.primitive(membrane.leave(res, "result")))
      res = ctx;
    return callstack.return(res);
  }

  apply.initialize = function (aran) { polyfill = Polyfill(aran) }

  var iconstructor = IConstructor(membrane, object, apply);

  var ifunction = IFunction(membrane, object, apply);

  var polyfill = function () {};

  return apply;

};

},{"./apply/irregular/constructor.js":2,"./apply/irregular/function.js":3,"./apply/polyfill.js":5,"./util.js":11}],2:[function(require,module,exports){

// Irregular built-in functions that behave specially when used as constructor

module.exports = function (membrane, composite, apply) {

  var constr = new Map();

  function Box (cst) {
    return function (val) {
      return composite.register(composite.register(new cst(val), "arguments[0]"), "result");
    }
  }

  constr.set(Error, Box(Error));

  constr.set(Boolean, Box(Boolean));

  constr.set(Number, Box(Number));

  constr.set(String, Box(String));

  constr.set(Object, Box(Object));

  return function (cst) { return constr.get(cst) };
}

},{}],3:[function(require,module,exports){

var Reflect = require("./function/reflect.js")

module.exports = function (membrane, composite, apply) {
  var map = new Map();
  Reflect(membrane, composite, apply, map);
  return function (fct) { return map.get(fct) };
}

},{"./function/reflect.js":4}],4:[function(require,module,exports){

// Irregular implementation of Reflect's functions.
// N.B. We added the non standard functions: Reflect.unary and Reflect.binary.
// The idea is to support language-level operations and the MOP from the start before polyfilling.
// This file is (very) tricky, here is some pitfalls:
//   - composite values should always by bypassed before accessing them through the MOP
//     because the proxy handlers in composite.js are made for external calls.
//   - the above point have to be applied when walking the prototype hiearchy as well!

module.exports = function (membrane, object, apply, map) {

  map.set(Reflect.apply, function (fct, ctx, args) {
    fct = membrane.leave(fct, "arguments[0]");
    var clean = [];
    var length = apply.irregular(Reflect.get, null, [args, "length", args], "arguments[2].length");
    for (var i=0; i<length; i++)
      clean[i] = apply.irregular(Reflect.get, null, [args, i, args], "arguments[2]["+i+"]");
    return apply(fct, ctx, clean, "apply");
  });

  map.set(Reflect.binary, function (op, left, right) {
    op = membrane.leave(op, "arguments[0]");
    left = membrane.leave(left, "arguments[1]");
    right = membrane.leave(right, "arguments[2]");
    return membrane.enter(Reflect.binary(op, left, right), "result");
  });

  map.set(Reflect.construct, function (cst, args) {
    cst = membrane.leave(cst, "arguments[0]");
    var clean = [];
    var length = apply.irregular(Reflect.get, null, [args, "length", args], "arguments[1].length");
    for (var i=0; i<length; i++)
      clean[i] = apply.irregular(Reflect.get, null, [args, i, args], "arguments[1]["+i+"]");
    return apply.construct(cst, clean, "construct");
  });

  // If obj is internal and des contains "value" then we have to create a mixed descriptor
  // that returns raw values for ["configurable", etc] and let des.value intact.
  map.set(Reflect.defineProperty, function (obj, key, des) {
    obj = membrane.leave(obj, "arguments[0]");
    key = membrane.leave(key, "arguments[1]");
    des = membrane.leave(des, "arguments[2]");
    var robj = object.bypass(obj);
    if (robj && ("value" in des)) {
      var copy = {};
      ["configurable", "enumerable", "writable", "get", "set"].forEach(function (k) {
        if (k in des)
          copy[k] = des[k];
      });
      copy.value = apply.irregular(Reflect.get, null, [des, "value", des], "arguments[2].value")
    }
    Reflect.defineProperty(robj||obj, key, des);
    return obj;
  });

  map.set(Reflect.deleteProperty, function (obj, key) {
    obj = membrane.leave(obj, "arguments[0]");
    key = membrane.leave(key, "arguments[1]");
    obj = object.bypass(obj) || obj;
    return membrane.leave(Reflect.deleteProperty(obj, key), "result");
  });

  map.set(Reflect.enumerate, function (obj) {
    obj = membrane.leave(obj, "arguments[0]");
    return object.register(Reflect.enumerate(object.bypass(obj)||obj).map(function (k, i) {
      return membrane.enter(k, "result["+i+"]");
    }));
  });

  map.set(Reflect.get, function (obj, key, rec) {
    obj = membrane.leave(obj, "arguments[0]");
    key = membrane.leave(key, "arguments[1]");
    do {
      var robj = object.bypass(obj);
      var des = Reflect.getOwnPropertyDescriptor(robj||obj, key);
      if (des) {
        if ("value" in des)
          return robj ? des.value : membrane.enter(des.value, "result");
        if (des.get)
          return apply(des.get, rec, [], "getter");
        return membrane.enter(undefined, "result");
      }
      obj = Reflect.getPrototypeOf(robj||obj);
    } while (obj)
    return membrane.enter(undefined, "result");
  });

  map.set(Reflect.getOwnPropertyDescriptor, function (obj, key) {
    obj = membrane.leave(obj, "arguments[0]");
    key = membrane.leave(key, "arguments[1]");
    var robj = object.bypass(obj);
    var des = Reflect.getOwnPropertyDescriptor(robj||obj, key);
    var copy = object.register({}, "result");
    for (var k in des)
      copy[k] = (k === "value" && robj) ? des.value : membrane.enter(des[k], "result."+k)
    return copy;
  });

  map.set(Reflect.getPrototypeOf, function (obj) {
    obj = membrane.leave(obj, "arguments[0]");
    obj = object.bypass(obj) || obj;
    return membrane.leave(Reflect.getPrototypeOf(obj), "result");
  });

  map.has(Reflect.has, function (obj, key) {
    obj = membrane.leave(obj, "arguments[0]");
    key = membrane.leave(key, "arguments[1]");
    do {
      obj = object.bypass(obj) || obj;
      if (Reflect.getOwnPropertyDescriptor(obj, key))
        return membrane.leave(true, "result");
      obj = Reflect.getPrototypeOf(obj);
    } while (obj)
    return membrane.leave(false, "result");
  });

  map.set(Reflect.isExtensible, function (obj) {
    obj = membrane.leave(obj, "arguments[0]");
    return membrane.enter(Reflect.isExtensible(object.bypass(obj)||obj), "result");
  });

  map.set(Reflect.ownKeys, function (obj) {
    obj = membrane.leave(obj, "arguments[0]");
    return object.register(Reflect.ownKeys(object.bypass(obj)||obj).map(function (k, i) {
      return membrane.enter(k, "result["+i+"]");
    }));
  });

  map.set(Reflect.preventExtensions, function (obj) {
    obj = membrane.leave(obj, "arguments[0]");
    Reflect.preventExtensions(object.bypass(obj)||obj);
    return obj;
  });

  function write (rec, key, val) {
    rec = membrane.leave(rec, "arguments[3]");
    var rrec = object.bypass(rec);
    Reflect.write(rrec||rec, key, rrec ? val : membrane.leave(val, "arguments[2]"))
    return val;
  }

  map.set(Reflect.set, function (obj, key, val, rec) {
    obj = membrane.leave(obj, "arguments[0]");
    key = membrane.leave(key, "arguments[1]");
    do {
      var robj = object.bypass(obj);
      var des = Reflect.getOwnPropertyDescriptor(robj||obj, key);
      if (des) {
        if (des.writable)
          return write(rec, key, val);
        if (des.set)
          apply(des.set, rec, [val], "setter");
        return val;
      }
      obj = Reflect.getPrototypeOf(robj||obj);
    } while (obj)
    return write(rec, key, val);
  });

  map.set(Reflect.setPrototypeOf, function (obj, proto) {
    obj = membrane.leave(obj, "arguments[0]");
    proto = membrane.leave(proto, "arguments[1]");
    Reflect.setPrototypeOf(object.bypass(obj)||obj, proto);
    return obj;
  });
 
  map.set(Reflect.unary, function (op, arg) {
    op = membrane.leave(op, "arguments[0]");
    arg = membrane.leave(arg, "arguments[1]");
    return membrane.enter(Reflect.unary(op, arg), "result");
  });

}

},{}],5:[function(require,module,exports){

module.exports = function (aran) {
  var poly = new Map();
  return function (fct) { poly.get(fct) }
}

},{}],6:[function(require,module,exports){

module.exports = function (stack) {

  var object = null;
  var xs = [];

  // function toString () {
  //   var msg = this.constructor ? "new "+this.constructor.name : this.function.name;
  //   if (this.context.type)
  //     return msg+" @ "+this.context.loc.start.line+":"+this.context.loc.start.column;
  //   return msg+" "+this.context;
  // }
  
  return {
    initialize: function (o) { object = o },
    apply: function (fct, ctx, args, info) {
      var x = Object.create(null);
      x.function = fct;
      x.this = ctx;
      x.length = args.length;
      x.context = info;
      for (var i=0; i<args.length; i++)
        x[i] = args[i];
      // x.toString = toString;
      xs.push(x);
      stack.push(x);
    },
    construct: function (cst, args, info) {
      var x = Object.create(null);
      x.constructor = cst;
      x.length = args.length;
      xcontext = info;
      for (var i=0; i<args.length; i++)
        x[i] = args[i];
      // x.toString = toString;
      xs.push(x);
      stack.push(x);
    },
    return: function (res) {
      stack.pop(res);
      return res;
    },
    try: function (ast) { xs.push(null) },
    catch: function (ast) {
      while (xs.pop())
        stack.pop();
    }
  }

}

},{}],7:[function(require,module,exports){

require("./reflect.js");
var Membrane = require("./membrane.js");
var Object = require("./object.js");
var CallStack = require("./callstack.js");
var Apply = require("./apply.js");
var Aran = require("aran");

module.exports = function (intercept, stack) {

  var membrane = Membrane(intercept, stack);

  var callstack = CallStack(stack);

  var object = Object(intercept.object, callstack, membrane);

  var thrown = {};
 
  callstack.initialize(object);

  var aran = Aran(null, {
    primitive: membrane.enter,
    test: membrane.leave,
    eval: membrane.leave,
    array: object.register,
    arguments: object.register,
    function: object.register,
    regexp: function (pattern, flags, ast) { return object.register(new RegExp(pattern, flags), ast) },
    object: function (props, ast) {
      var o = {};
      props.forEach(function (p) {
        p.configurable = true
        p.enumerable = true
        if (p.value)
          p.writable = true
        Reflect.defineProperty(o, p.key, p);
      });
      return object.register(o, ast);
    },
    throw: function (err, ast) { return thrown = err },
    try: function (ast) { callstack.try(ast) },
    catch: function (err, ast) {
      err = (err === thrown) ? err : object.register(err, ast);
      thrown = {};
      callstack.catch(err);
      return err;
    },
    apply: function (fct, ctx, args, ast) { return apply(fct, ctx, args, ast) },
    construct: function (fct, args, ast) { return apply.construct(fct, args, ast) },
    unary: function (op, arg, ast) { return apply.irregular(Reflect.unary, null, [op,arg], ast) },
    binary: function (op, left, right, ast) { return apply.irregular(Reflect.binary, null, [op,left,right], ast) },
    get: function (obj, key, ast) { return apply.irregular(Reflect.get, null, [obj,key,obj], ast) },
    set: function (obj, key, val, ast) { return apply.irregular(Reflect.set, null, [obj,key,val,obj], ast) },
    delete: function (obj, key, ast) { return apply.irregular(Reflect.deleteProperty, null, [obj,key], ast) },
    enumerate: function (obj, ast) { return apply.irregular(Reflect.enumerate, null, [obj], ast) }
  }, {ast:true, loc:true});
  
  var apply = Apply(callstack, membrane, object);

  apply.initialize(aran);

  return aran;

}

},{"./apply.js":1,"./callstack.js":6,"./membrane.js":8,"./object.js":9,"./reflect.js":10,"aran":"aran"}],8:[function(require,module,exports){

var Util = require("./util.js");

module.exports = function (intercept, stack) {

  // Turn the membrane off when analysis code is executing //
  var on = true;
  var toogle = function (fct) {
    return function () {
      var save = on;
      on = false;
      var res = fct.apply(this, arguments);
      on = save;
      return res;
    }
  };
  intercept.primitive = toogle(intercept.primitive);
  intercept.object = toogle(intercept.object);
  stack.push = toogle(stack.push);
  stack.pop = toogle(stack.pop);

  var wrappers = new WeakSet();

  function enter (val, info) {
    if (on&&Util.primitive(val)) {
      var wrapper = intercept.primitive(val, info);
      if (!Util.primitive(wrapper))
        wrappers.add(wrapper);
      return wrapper;
    }
    return val;
  }

  function leave (val, info) { return (on&&wrappers.has(val)) ? toogle(val.unwrap).call(val, info) : val }

  return {enter:enter, leave:leave};

}

},{"./util.js":11}],9:[function(require,module,exports){

var Util = require("./util.js");

module.exports = function (onobject, callstack, membrane) {

  var proxies = new WeakMap();

  function write (rec, key, val) {
    rec = membrane.leave(rec, "arguments[3]");
    var rrec = bypass(rec);
    Reflect.write(rrec||rec, key, rrec ? val : membrane.leave(val, "arguments[2]"));
    return val
  }

  var handlers = {
    apply: function (fct, ctx, args) {
      callstack.apply(fct, ctx, args, null);
      ctx = membrane.enter(ctx, "this");
      for (var i=0; i<args.length; i++)
        args[i] = membrane.enter(args[0], "arguments["+i+"]");
      return callstack.return(membrane.leave(Reflect.apply(fct, ctx, args), "result"));
    },
    construct: function (cst, args) {
      callstack.construct(cst, args, null);
      var proto = handlers.get(cst, "prototype", cst);
      var ctx = register(Object.create(proto), "this");
      for (var i=0; i<args.length; i++)
        args[i] = membrane.enter(args[0], "arguments["+i+"]");
      var res = membrane.leave(Reflect.apply(cst, ctx, args), "result");
      return callstack.return(Util.primitive(res) ? ctx : res);
    },
    get: function (obj, key, rec) {
      var des = Reflect.getOwnPropertyDescriptor(obj, key);
      if (des) {
        if ("value" in des)
          return membrane.leave(des.value, "get");
        if (des.get)
          return Reflect.apply(des.get, rec, []);
        return undefined;
      }
      var proto = Reflect.getPrototypeOf(obj);
      if (proto === null)
        return undefined;
      return Reflect.get(proto, key, rec);
    },
    set: function (obj, key, val, rec) {
      var des = Reflect.getOwnPropertyDescriptor(obj, key);
      if (des) {
        if (des.writable)
          return write(rec, key, val);
        else if (des.set)
          Reflect.apply(des.set, rec, [val]);
        return val;
      }
      var proto = Reflect.getPrototypeOf(obj);
      if (proto === null)
        return write(rec, key, val);
      return Reflect.set(proto, key, val, rec);
    },
    getOwnPropertyDescriptor: function (obj, key) {
      var des = Reflect.getOwnPropertyDescriptor(obj, key);
      if (des)
        des.value = membrane.leave(des.value, "getOwnPropertyDescriptor");
      return des;
    },
    defineProperty: function (obj, key, des) {
      des.value = membrane.enter(des.value, "defineProperty");
      return Reflect.defineProperty(obj, key, des);
    }
  }

  function bypass (val) { return proxies.get(val) }

  function register (val, info) {
    var pxy = new Proxy(val, handlers);
    pxy = onobject(pxy, info);
    proxies.set(pxy, val);
    return pxy;
  }

  return {bypass:bypass, register:register}

}

},{"./util.js":11}],10:[function(require,module,exports){
(function (global){

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



}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],11:[function(require,module,exports){

exports.primitive = function (x) {
  var t = typeof x;
  return x === null
      || x === undefined
      || t === "boolean"
      || t === "number"
      || t === "string"
      || t === "symbol";
}

},{}],"master":[function(require,module,exports){
var calls = [];

function unwrap (ctx) { return NaN }
var intercept = {
  primitive: function (val, ctx) {
    if (isNaN(val))
      return {call:calls[calls.length-1], unwrap:unwrap};
    return val;
  },
  object: function (obj, ctx) { return obj }
};

var Linvail = require("..");
module.exports = Linvail(intercept, calls);
},{"..":7}]},{},[]);
