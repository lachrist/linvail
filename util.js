
exports.primitive = function (x) {
  var t = typeof x;
  return x === null
      || x === undefined
      || t === "boolean"
      || t === "number"
      || t === "string"
      || t === "symbol";
}
