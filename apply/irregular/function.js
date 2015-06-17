
var Reflect = require("./function/reflect.js")

module.exports = function (membrane, composite, apply) {
  var map = new Map();
  Reflect(membrane, composite, apply, map);
  return function (fct) { return map.get(fct) };
}
