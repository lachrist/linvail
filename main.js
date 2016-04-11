
var Ast = require("./ast.js");
var Polyfill = require("./polyfill.js");
var Control = require("./control.js");
var Data = require("./data.js");
var Util = require("./util.js");

module.exports = function (stack, wrap) {
  Polyfill();
  var ast = Ast();
  var control = Control(stack, Data(wrap));
  var Reflect = Util.copy((function () { return this.Reflect } ()));
  var eval = (function () { return this.eval } ());
  (function () { return this } ()).aran = {
    Ast:       ast.add,
    literal:   function (val, idx)             { return control.apply(Reflect.literal,        undefined, [val],                search(idx)) },
    unary:     function (op, arg, idx)         { return control.apply(Reflect.unary,          undefined, [op, arg],            search(idx)) },
    binary:    function (op, left, right, idx) { return control.apply(Reflect.binary,         undefined, [op, left, right],    search(idx)) },
    apply:     function (fct, ths, args, idx)  { return control.apply(fct,                    ths,       args,                 search(idx)) },
    construct: function (cst, args, idx)       { return control.construct(cst,                           args,                 search(idx)) },
    eval:      function (args, idx)            { return control.apply(eval,                   undefined, args,                 search(idx)) },
    get:       function (obj, key, idx)        { return control.apply(Reflect.get,            undefined, [obj, key, obj],      search(idx)) },
    set:       function (obj, key, val, idx)   { return control.apply(Reflect.set,            undefined, [obj, key, val, obj], search(idx)) },
    delete:    function (obj, key, idx)        { return control.apply(Reflect.deleteProperty, undefined, [obj, key],           search(idx)) },
    enumerate: function (obj, idx)             { return control.apply(Reflect.enumerate,      undefined, [obj],                search(idx)) },
    test:      function (val, idx)             { return control.apply(Reflect.test,           undefined, [val],                search(idx)) },
    Try:       function (idx)                  { return control.try(search(idx)) },
    Finally:   function (idx)                  { return control.finally() }
  };
};
