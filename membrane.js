
var Util = require("./util.js");

modules.exports = function (onprimitive) {

  var wrappers = new WeakSet();

  function enter (val, info) {
    if (util.primitive(val)) {
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
      return val.unwrap();
    return val;
  }

  return {enter:enter, leave:leave};

}
