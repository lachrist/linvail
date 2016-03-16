
var Linvail = require("../main.js");
module.exports = function (master, target) {
  var module = {};
  eval(master);
  return module.exports(target);
}
