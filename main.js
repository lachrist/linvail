
var Reflect = require("./reflect.js");
var Membrane = require("./membrane.js");
var Composite = require("./composite.js");
var Apply = require("./apply.js");

function Linvail (intercept, callstack) {

  var membrane = Membrane(intercept.primitive);
  
  var composite = Composite(intercept, callstack, membrane);

  var aran = Aran({
    primitive: intercept.primitive,
    test: meta.control,
    eval: meta.control,

    regexp: composite.regexp,
    array: function (value, ast) {
      return apply(save.Array, null, value, ast);
    },
    object: function (properties, ast) {
      var o = apply(Save.create, null, [Object.prototype], ast);
      return apply(Save.defineProperties, null, [o, properties], ast)
    },
    throw: function (value, ast) {
      thrown = true;
      return value;
    },
    try: function (ast) {
      callstack.try(ast);
    },
    catch: function (err, ast) {
      callstack.catch(err);
      // We assume JS engine only throw
      // error instances with a proper
      // string as message.
      if (thrown) {
        thrown = false;
        return value;
      }
      var message = traps.primitive(value.message, ast);
      return apply(Reflect.construct, null, [Error, [message]], ast);
    },
    arguments: function (value, ast) {
      var args = composite.arguments(ast);
      for (var i=0; i<value.length; i++)
        apply(Reflect.set, null, [args, i, value[i]], ast);
      return args;
    },
    function: function (fct, ast) {

      apply.internal(value);
      return traps.function(value, ast);
    },
    apply: function (fct, ctx, args, ast) { return apply.clean(fct, ctx, args, ast) },
    construct: function (fct, args, ast) { return apply.construct(fct, args, ast) },
    unary: function (op, arg, ast) { return apply.reflect(Reflect.unary, null, [op,arg], ast) },
    binary: function (op, left, right, ast) { return apply.reflect(Reflect.binary, null, [op,left,right], ast) },
    get: function (obj, key, ast) { return apply.reflect(Reflect.get, null, [obj,key,obj], ast) },
    set: function (obj, key, val, ast) { return apply.reflect(Reflect.set, null, [obj,key,val,obj], ast) },
    delete: function (obj, key, ast) { return apply.reflect(Reflect.deleteProperty, null, [obj,key], ast) },
    enumerate: function (obj, ast) { return apply.reflect(Reflect.enumerate, null, [obj,key], ast) }
  });
  
  var apply = Apply(membrane, composite, aran);

  return function (x, y, z) {
    if (arguments.length === 3)
      return meta.wrap(x, y, z);
    return aran(x);
  }

}

Linvail.reflect = Reflect;
modules.exports = Linvail;
