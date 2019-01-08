
const WeakMap = global.WeakMap;
const WeakMap_prototype_get = WeakMap.prototype.get;
const WeakMap_prototype_has = WeakMap.prototype.has;
const WeakMap_prototype_set = WeakMap.prototype.set;

module.exports = () => {
  const weakmap = new WeakMap();
  weakmap.get = WeakMap_prototype_get;
  weakmap.has = WeakMap_prototype_has;
  weakmap.set = WeakMap_prototype_set;
  return weakmap;
};
