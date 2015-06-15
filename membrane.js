
var Primitive = require("./primitive.js");

modules.exports = function (onprimitive) {

  var wrappers = new WeakSet();

  function enter (val, info) {
    if (Primitive(val)) {
      var wrapper = onprimitive(val, info);
      if (wrapper) {
        wrappers.add(wrapper);
        return wrapper;
      }
    }
    return val;
  }

  function leave (val, info) {
    if (wrappers.has(val))
      return val.unwrap(val.shadow, info);
    return val;
  }

  return {enter:enter, leave:leave};

}
