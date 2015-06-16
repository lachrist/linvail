
var Reflect = require("./function/reflect.js")

modules.exports = function (membrane, composite, apply) {
  var map = new Map();
  Reflect(membrane, composite, apply, map);
  return function (fct) { return map.get(fct) };
}
