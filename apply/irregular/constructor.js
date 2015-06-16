
// Irregular built-in functions that behave specially when used as constructor

modules.exports = function (membrane, composite, apply) {

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
