
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
