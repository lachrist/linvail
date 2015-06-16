
module.exports = function (aran) {
  var poly = new Map();
  return function (fct) { poly.get(fct) }
}
