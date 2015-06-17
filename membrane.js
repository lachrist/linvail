
var Util = require("./util.js");

module.exports = function (onprimitive) {

  var wrappers = new WeakSet();

  function enter (val, info) {
    if (util.primitive(val)) {
      var wrapper = onprimitive(val, info);
      if (typeof wrapper === "object") {
        wrappers.add(wrapper);
        return wrapper;
      }
    }
    return val;
  }

  function leave (val, info) { return wrappers.has(val) ? val.unwrap(info) : val }

  return {enter:enter, leave:leave};

}
