require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

var IFunction = require("./apply/irregular/function.js");
var IConstructor = require("./apply/irregular/constructor.js");
var Polyfill = require("./apply/polyfill.js");
var Util = require("./util.js");

module.exports = function (membrane, object) {

  function leave1 (arg, idx) { return membrane.leave(arg, "arguments["+idx+"]") }
  function leave2 (arg, idx) { return membrane.leave(arg, "arguments[1]["+idx+"]") }

  function apply (fct, ctx, args, info) {
    callstack.push(fct, ctx, args, info);
    fct = membrane.leave(fct, "function");
    fct = polyfill(fct) || fct;
    var res, raw = object.bypass(fct) || ifunction(fct);
    if (raw)
      res = Reflect.apply(raw, ctx, args);
    else
      res = membrane.enter(Reflect.apply(raw, membrane.leave(ctx, "this"), args.map(leave1)));
    callstack.pop(res);
    return res;
  }

  apply.irregular = function (fct, ctx, args, info) {
    callstack.push(fct, ctx, args, info);
    var res = Reflect.apply(ifunction(fct), ctx, args);  
    callstack.pop(res);
    return res;
  }

  apply.construct = function (cst, args, info) {
    callstack.push(Reflect.construct, null, [cst, args], info);
    var icst = iconstructor(cst);
    if (icst) {
      callstack.push(cst, null, args, "construct");
      var res = Reflect.construct(icst, args);
      callstack.pop(res);
    } else {
      var proto = apply.irregular(Reflect.get, null, [cst, "prototype", cst], "arguments[0].prototype");
      var ctx = object.register(Object.create(proto), "new");
      var res = apply(cst, ctx, args, "construct");
      if (Util.primitive(membrane.leave(res)))
        res = ctx;
    }
    callstack.pop(res);
    return res;
  }

  apply.initialize = function (aran) { polyfill = Polyfill(aran) }

  var iconstructor = IConstructor(membrane, object, apply);

  var ifunction = IFunction(membrane, object, apply);

  var polyfill = function () {};

  return apply;

};

},{"./apply/irregular/constructor.js":2,"./apply/irregular/function.js":3,"./apply/polyfill.js":5,"./util.js":10}],2:[function(require,module,exports){

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
    fct = membrane.leave(fct, "arguments[0]");
    var clean = [];
    var length = apply.irregular(Reflect.get, null, [args, "length", args], "arguments[1].length");
    for (var i=0; i<length; i++)
      clean[i] = apply.irregular(Reflect.get, null, [args, i, args], "arguments[1]["+i+"]");
    return apply.construct(fct, clean, "construct");
  });

  map.set(Reflect.defineProperty, function (obj, key, des) {
    throw new Error("TODO");
    // var res = obj;
    // var rawobj = composite.bypass(obj);
    // var rawdes = composite.bypass(des);
    // key = membrane.leave(key, "arguments[1]");
    
    // if (rawobj) {
    //   obj = rawobj;
    //   var copy = {}
    //   if ("value" in des) copy.value = apply(Reflect.get, null, [des, "value", des], "arguments[2].value");
    //   ["configurable", "enumerable", "writable", "get", "set"].forEach(function (k) {
    //     if (k in rawdes) des[k] = membrane.leave(apply(Reflect.get, null, [des, k, des], "arguments[2]."+k), "arguments[2]."+k)
    //   });
    // } else {
    //   var copy = {}
    //   if ("value" in des) copy.value = apply(Reflect.get, null [des, "value", des], "arguments[2].value")
    // }if (rawobj) {
    //   obj = rawobj;
    //   for (var k in )
    // } else if (rawdes) {
    // } else {
    // } 
    // return res;
  });

  map.set(Reflect.deleteProperty, function (obj, key) {
    obj = membrane.leave(obj, "arguments[0]");
    obj = object.bypass(obj) || obj;
    key = membrane.leave(key, "arguments[1]");
    return membrane.leave(Reflect.deleteProperty(obj, key), "result");
  });

  map.set(Reflect.enumerate, function (obj) {
    obj = membrane.leave(obj, "arguments[0]");
    obj = object.bypass(obj) || obj;
    var keys = Reflect.enumerate(obj);
    var res = object.register([], "result");
    var rawres = object.bypass(res);
    for (var i=0; i<keys.length; i++)
      (rawres||res)[i] = membrane.enter(keys[i], "result["+i+"]");
    return res;
  });

  map.set(Reflect.get, function (obj, key, rec) {
    obj = membrane.leave(obj, "arguments[0]");
    key = membrane.leave(key, "arguments[1]");
    var rawobj = object.bypass(obj);
    var des = Reflect.getOwnPropertyDescriptor(rawobj||obj, key);
    if (des) {
      if ("value" in des)
        return rawobj ? des.value : membrane.enter(des.value, "result");
      if (des.get)
        return apply(des.get, rec, [], "getter");
      return membrane.enter(undefined, "result");
    }
    return apply.irregular(Reflect.get, null, [Reflect.getPrototypeOf(rawobj||obj), key, rec], "prototype");
  });

  map.set(Reflect.getOwnPropertyDescriptor, function (obj, key) {
    throw new Error("TODO");
    // key = membrane.leave(key, "arguments[1]");
    // var raw = composite.bypass(obj);
    // var des = Reflect.getOwnPropertyDescriptor(raw||obj, key);
    // var res = composite.object(Object.prototype, "result");
    // res.configurable = membrane.enter();
    // if (raw) {
    //   des = Reflect.getOwnPropertyDescriptor(raw, key);

    // } else {

    // }
    // return des;
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
    var keys = Reflect.ownKeys(object.bypass(obj) || obj);
    var res = object.register([], "result");
    var rawres = object.bypass(res);
    for (var i=0; i<keys.length; i++)
      (rawres||res)[i] = membrane.enter(keys[i], "result["+i+"]");
    return res;
  });

  map.set(Reflect.preventExtensions, function (obj) {
    obj = membrane.leave(obj, "arguments[0]");
    Reflect.preventExtensions(object.bypass(obj)||obj);
    return obj;
  });

  map.set(Reflect.set, function (obj, key, val, rec) {
    obj = membrane.leave(obj, "arguments[0]");
    key = membrane.leave(key, "arguments[1]");
    var des = Reflect.getOwnPropertyDescriptor(object.bypass(obj)||obj, key);
    if (des) {
      if (des.writable) {
        var rawrec = object.bypass(obj);
        Reflect.defineProperty(rawrec||rec, key, {
          configurable: true,
          enumerable: true,
          writable: true,
          value: rawrec ? val : membrane.leave(val, "arguments[2]")
        });
      }
      if (des.set)
        apply.clean(des.set, rec, [val], "setter");
      return val;
    }
    return apply.irregular(Reflect.set, null, [Reflect.getPrototypeOf(obj), key, rec], "prototype");
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

require("./reflect.js");
var Membrane = require("./membrane.js");
var OObject = require("./object.js");
var Apply = require("./apply.js");
var Aran = require("aran");

module.exports = function (intercept, callstack) {

  var membrane = Membrane(intercept.primitive);

  var object = OObject(intercept.object, callstack, membrane);

  var aran = Aran(null, {
    primitive: membrane.enter,
    test: membrane.leave,
    eval: membrane.leave,
    regexp: object.register,
    array: object.register,
    object: function (props, ast) {
      var obj = object.register({}, ast);
      for (var k in props)
        apply.irregular(Reflect.defineProperty, null, [obj, k, props[k]], ast);
      return obj;
    },
    try: function (ast) { callstack.try(ast) },
    catch: function (err, ast) {
      if (!object.bypass(err))
        err = object.register(err, ast);
      callstack.catch(err);
      return err;
    },
    arguments: object.register,
    function: object.register,
    apply: function (fct, ctx, args, ast) { return apply(fct, ctx, args, ast) },
    construct: function (fct, args, ast) { return apply.construct(fct, args, ast) },
    unary: function (op, arg, ast) { return apply.irregular(Reflect.unary, null, [op,arg], ast) },
    binary: function (op, left, right, ast) { return apply.irregular(Reflect.binary, null, [op,left,right], ast) },
    get: function (obj, key, ast) { return apply.irregular(Reflect.get, null, [obj,key,obj], ast) },
    set: function (obj, key, val, ast) { return apply.irregular(Reflect.set, null, [obj,key,val,obj], ast) },
    delete: function (obj, key, ast) { return apply.irregular(Reflect.deleteProperty, null, [obj,key], ast) },
    enumerate: function (obj, ast) { return apply.irregular(Reflect.enumerate, null, [obj,key], ast) }
  }, {ast:true, loc:true});
  
  var apply = Apply(membrane, object);

  apply.initialize(aran);

  return aran;

}

},{"./apply.js":1,"./membrane.js":7,"./object.js":8,"./reflect.js":9,"aran":"aran"}],7:[function(require,module,exports){

var Util = require("./util.js");

module.exports = function (onprimitive) {

  var wrappers = new WeakSet();

  function enter (val, info) {
    if (util.primitive(val)) {
      var wrapper = onprimitive(val, info);
      if (typeof wrapper === "object") {
        wrappers.add(wrapper);
        return wrapper;
      }
    }
    return val;
  }

  function leave (val, info) { return wrappers.has(val) ? val.unwrap(info) : val }

  return {enter:enter, leave:leave};

}

},{"./util.js":10}],8:[function(require,module,exports){

var Util = require("./util.js");

module.exports = function (onobject, callstack, membrane) {

  var proxies = new WeakMap();

  var handlers = {
    apply: function (fct, ctx, args) {
      callstack.apply(fct, ctx, args);
      ctx = membrane.enter(ctx, "this");
      for (var i=0; i<args.length; i++)
        args[i] = membrane.enter(args[0], "arguments["+i+"]");
      var res = membrane.leave(Reflect.apply(fct, ctx, args), "result");
      callstack.pop();
      return res;
    },
    construct: function (cst, args) {
      callstack.construct(cst, args);
      var proto = handlers.get(cst, "prototype", cst);
      var ctx = register(Object.create(proto), "this");
      for (var i=0; i<args.length; i++)
        args[i] = membrane.enter(args[0], "arguments["+i+"]");
      var res = membrane.leave(Reflect.apply(fct, ctx, args), "result");
      callstack.pop();
      return Util.primitive(res) ? ctx : res;
    },
    get: function (obj, key, rec) {
      var des = Reflect.getOwnPropertyDescriptor(obj);
      if (des) {
        if ("value" in des)
          return membrane.leave(des.value, "get");
        if (des.get)
          return Reflect.apply(des.get, rec, []);
        return undefined;
      }
      return Reflect.get(Reflect.getPrototypeOf(obj), key, rec);
    },
    set: function (obj, key, val, rec) {
      var des = Reflect.getOwnPropertyDescriptor(obj);
      if (des) {
        if (des.writable)
          Reflect.defineProperty(rec, key, {
            configurable: true,
            enumerable: true,
            writable: true,
            value: val
          });
        else if (des.set)
          Reflect.apply(des.set, rec, [val]);
        return val;
      }
      return Reflect.set(Reflect.getPrototypeOf(obj), key, val, rec);
    },
    getOwnPropertyDescriptor: function (obj, key) {
      var des = Reflect.getOwnPropertyDescriptor(obj, key);
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
    var p = new Proxy(onobject(val, info), handlers);
    proxies.set(p, val);
    return p;
  }

  return {bypass:bypass, register:register}

}

},{"./util.js":10}],9:[function(require,module,exports){
(function (global){

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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],10:[function(require,module,exports){

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

var Linvail = require("..");
var id = 0;

function printi (x) { x.type ? x.type+"@"+x.loc.start.line+":"+x.loc.start.column : x }

var intercept = {
  primitive: function (val, info) {
    console.log("primitive"+(++id)+" ["+JSON.stringify(val)+"] intercepted @ "+printi(info));
    return {
      id: id,
      inner: val,
      unwrap: function (info) {
        console.log("primitive"+this.id+" accessed @ "+printi(info));
        return this.inner;
      }
    };
  },
  object: function (obj, info) {
    console.log("object"+(++id)+" ["+obj+"] intercepted @ "+printi(info));
    return obj;
  }
}

var callstack = {
  push: function (fct, ctx, args, info) { console.log("PUSH "+printi(info)) },
  pop: function (res) { console.log("POP") },
  try: function (info) { console.log("TRY") },
  catch: function (err, info) { console.log("CATCH") }
};

module.exports = Linvail(intercept, callstack, Aran);

},{"..":6}]},{},[]);
