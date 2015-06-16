
require("./reflect.js");
var Membrane = require("./membrane.js");
var OObject = require("./object.js");
var Apply = require("./apply.js");

module.exports = function (intercept, callstack) {

  var membrane = Membrane(intercept.primitive);

  var object = OObject(intercept.object, callstack, membrane);

  var aran = Aran({
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
  });
  
  var apply = Apply(membrane, object);

  apply.initialize(aran);

  return aran;

}
