
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

  var aran = Aran({
    ast:true,
    loc:true,
    traps: {
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
      Try: function (ast) { callstack.try(ast) },
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
    }
  });
  
  var apply = Apply(callstack, membrane, object);

  // apply.initialize(aran);

  return aran;

}
