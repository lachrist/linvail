
const ArrayLite = require("array-lite");

const Array_isArray = Array.isArray;
const Proxy = global.Proxy;
const WeakMap = global.WeakMap;
const Reflect_apply = Reflect.apply;
const Reflect_construct = Reflect.construct;
const Reflect_deleteProperty = Reflect.deleteProperty;
const Reflect_get = Reflect.get;
const Reflect_set = Reflect.set;
const Reflect_has = Reflect.has;
const WeakMap_prototype_get = WeakMap.prototype.get;
const WeakMap_prototype_set = WeakMap.prototype.set;

module.exports = (enter, leave) => {

  const humans = new WeakMap();
  humans.get = WeakMap_prototype_get;
  humans.set = WeakMap_prototype_set;

  const wolves = new WeakMap();
  wolves.get = WeakMap_prototype_get;
  wolves.set = WeakMap_prototype_set;

  const handlers = {};

  handlers.apply = (target, $value, $values) => enter(
    Reflect_apply(
      target.human,
      leave($value),
      ArrayLite.map($values, leave)));

  handlers.construct = (target, $values) => enter(
    Reflect_construct(
      target.human,
      ArrayLite.map($values, leave)));

  handlers.get = (target, key, receiver) => enter(
    Reflect_get(
      target.human,
      key,
      humans.get(receiver)));

  handlers.set = (target, key, $value, receiver) => Reflect_set(
    target.human,
    key,
    leave($value),
    humans.get(receiver));

  handlers.deleteProperty = (target, key) => Reflect_deleteProperty(
    target.human,
    key);

  handlers.has = (target, key) => Reflect_has(
    target.human,
    key);

  // with proxies only define data property with wrapper values
  handlers.defineProperty = (target, key, descriptor) => {
    descriptor.value = leave(descriptor.value);
    return Reflect_defineProperty(target, key, descriptor);
  };

  return {
    unturn: (wolf) => humans.get(wolf),
    turn: (human) => wolves.get(human),
    bite: (human) => {
      // nested target to get rid of limitation:
      // TypeError: 'get' on proxy: property 'XXX' is a read-only and non-configurable
      // data property on the proxy target but the proxy did not return its actual value
      const target = (
        typeof human === "function" ?
        function () {} :
        (Array_isArray(human) ? [] : {}));
      target.human = human;
      const wolf = new Proxy(target, handlers);
      humans.set(wolf, human);
      wolves.set(human, wolf);
      return wolf;
    }
  };

};
