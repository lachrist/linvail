
exports.copy = function (obj1) {
  var obj2 = Object.create(obj1.__proto__);
  for (var key in obj1)
    obj2[key] = obj1[key];
  return obj2;
}
