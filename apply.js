
// The kernel is just a specific implementation for internal calls to Reflect.
// N.B. We added the non standard functions: Reflect.unary and Reflect.binary.
// The idea is to support language-level operations and the MOP from the start before polyfilling.
// This file is (very) tricky, here is some pitfalls:
//   - composite values should always by bypassed before accessing them through the MOP
//     because the proxy handlers in composite.js are made for external calls.
//   - the above point have to be applied when walking the prototype hiearchy as well!

var Reflect = require("./reflect.js");
var Polyfill = require("./polyfill.js");

modules.exports = function (membrane, composite, aran) {

  function leavearg (arg, idx) { return membrane.leave(arg, "arguments["+idx+"]") }
  
  var kernel = new Map();

  var apply = {
    // fct is an element of Reflect && args is a clean array
    reflect: function (fct, ctx, args, info) {
      callstack.apply(fct, ctx, args, info);
      var res = Reflect.apply(kernel.get(fct), ctx, args);  
      callstack.return(res);
      return res;
    },
    // arbitrary fct && args is a clean array
    clean: function (fct, ctx, args, info) {
      callstack.apply(fct, ctx, args, info);
      fct = membrane.leave(fct, "function");
      fct = polyfill(fct) || fct;
      var res, raw = composite.bypass(fct);
      if (raw)
        res = Reflect.apply(raw, ctx, args);
      else
        res = membrane.enter(Reflect.apply(raw, membrane.leave(ctx, "this"), args.map(leavearg)));
      callstack.return(res);
      return res;
    },
    // arbitrary cst && args is a clean array
    construct: function (cst, args, info) {
      callstack.construct(cst, args, info);
      cst = membrane.leave(cst, "constructor");
      cst = polyfill(cst) || cst;
      var res, raw = composite.bypass(cst) || kernel.get(fct);
      if (raw) {
        var proto = apply.reflect(Reflect.get, null, [cst, "prototype", cst], "constructor.prototype");
        var ctx = composite.object(proto, "this");
        res = membrane.leave(Reflect.apply(raw, ctx, args), "result");
        res = Primitive(res) ? ctx : res;
      }
      else
        res = Reflect.construct(fct, args.map(leavearg));
      callstack.return(res);
      return res;
    }
  }

  kernel.set(Reflect.apply, function (fct, ctx, args) {
    fct = membrane.leave(fct, "arguments[0]");
    var clean = [];
    var length = apply.reflect(Reflect.get, null, [args, "length", args], "arguments[2].length");
    for (var i=0; i<length; i++)
      clean[i] = apply.reflect(Reflect.get, null, [args, i, args], "arguments[2]["+i+"]");
    return apply.clean(fct, ctx, clean, "apply");
  });

  kernel.set(Reflect.binary, function (op, left, right) {
    op = membrane.leave(op, "arguments[0]");
    left = membrane.leave(left, "arguments[1]");
    right = membrane.leave(right, "arguments[2]");
    return membrane.enter(Reflect.binary(op, left, right), "result");
  })

  kernel.set(Reflect.construct, function (cst, args) {
    fct = membrane.leave(fct, "arguments[0]");
    var clean = [];
    var length = apply.reflect(Reflect.get, null, [args, "length", args], "arguments[1].length");
    for (var i=0; i<length; i++)
      clean[i] = apply.reflect(Reflect.get, null, [args, i, args], "arguments[1]["+i+"]");
    return apply.construct(fct, clean, "construct");
  });

  kernel.set(Reflect.defineProperty, function (obj, key, des) {
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
  }

  kernel.set(Reflect.deleteProperty, function (obj, key) {
    obj = membrane.leave(obj, "arguments[0]");
    obj = composite.bypass(obj) || obj;
    key = membrane.leave(key, "arguments[1]");
    return membrane.leave(Reflect.deleteProperty(obj, key), "result");
  });

  kernel.set(Reflect.enumerate, function (obj) {
    obj = membrane.leave(obj, "arguments[0]");
    obj = composite.bypass(obj) || obj;
    var keys = Reflect.enumerate(obj);
    var res = composite.array("result");
    var rawres = composite.bypass(res);
    for (var i=0; i<keys.length; i++)
      (rawres||res)[i] = membrane.enter(keys[i], "result["+i+"]");
    return res;
  });

  kernel.set(Reflect.get, function (obj, key, rec) {
    obj = membrane.leave(obj, "arguments[0]");
    key = membrane.leave(key, "arguments[1]");
    var rawobj = composite.bypass(obj);
    var des = Reflect.getOwnPropertyDescriptor(rawobj||obj, key);
    if (des) {
      if ("value" in des)
        return rawobj ? des.value : membrane.enter(des.value, "result");
      if (des.get)
        return apply.clean(des.get, rec, [], "getter");
      return membrane.enter(undefined, "result");
    }
    return apply.reflect(Reflect.get, null, [Reflect.getPrototypeOf(rawobj||obj), key, rec], "prototype");
  });

  kernel.set(Reflect.getOwnPropertyDescriptor, function (obj, key) {
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

  kernel.set(Reflect.getPrototypeOf, function (obj) {
    obj = membrane.leave(obj, "arguments[0]");
    obj = composite.bypass(obj) || obj;
    return membrane.leave(Reflect.getPrototypeOf(obj), "result");
  });

  kernel.has(Reflect.has, function (obj, key) {
    obj = membrane.leave(obj, "arguments[0]");
    key = membrane.leave(key, "arguments[1]");
    do {
      obj = composite.bypass(obj) || obj;
      if (Reflect.getOwnPropertyDescriptor(obj, key))
        return membrane.leave(true, "result");
      obj = Reflect.getPrototypeOf(obj);
    } while (obj)
    return membrane.leave(false, "result");
  });

  kernel.set(Reflect.isExtensible, function (obj) {
    obj = membrane.leave(obj, "arguments[0]");
    return membrane.enter(Reflect.isExtensible(composite.bypass(obj)||obj), "result");
  })

  kernel.set(Reflect.ownKeys, function (obj) {
    obj = membrane.leave(obj, "arguments[0]");
    var keys = Reflect.ownKeys(composite.bypass(obj) || obj);
    var res = composite.array("result");
    var rawres = composite.bypass(res);
    for (var i=0; i<keys.length; i++)
      (rawres||res)[i] = membrane.enter(keys[i], "result["+i+"]");
    return res;
  });

  kernel.set(Reflect.preventExtensions, function (obj) {
    obj = membrane.leave(obj, "arguments[0]");
    Reflect.preventExtensions(composite.bypass(obj)||obj);
    return obj;
  });

  kernel.set(Reflect.set, set);
  function set (obj, key, val, rec) {
    obj = membrane.leave(obj, "arguments[0]");
    key = membrane.leave(key, "arguments[1]");
    var des = Reflect.getOwnPropertyDescriptor(composite.bypass(obj)||obj, key);
    if (des) {
      if (des.writable) {
        var rawrec = composite.bypass(obj);
        Reflect.defineProperty(rawrec||rec, key, {
          configurable: true,
          enumerable: true,
          writable: true,
          value: rawrec ? val : membrane.leave(val, "arguments[2]");
        });
      }
      if (des.set)
        apply.clean(des.set, rec, [val], "setter");
      return val;
    }
    return apply.reflect(Reflect.set, null, [Reflect.getPrototypeOf(obj), key, rec], "prototype");
  });

  kernel.set(Reflect.setPrototypeOf, function (obj, proto) {
    obj = membrane.leave(obj, "arguments[0]");
    proto = membrane.leave(proto, "arguments[1]");
    Reflect.setPrototypeOf(composite.bypass(obj)||obj, proto);
    return obj;
  });
 
  kernel.set(Reflect.unary, function (op, arg) {
    op = membrane.leave(op, "arguments[0]");
    arg = membrane.leave(arg, "arguments[1]");
    return membrane.enter(Reflect.unary(op, arg), "result");
  });

  var polyfill = Polyfill(aran);

  return apply;

};
