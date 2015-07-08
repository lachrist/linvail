
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
