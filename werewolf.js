
const ArrayLite = require("array-lite");

const Proxy = global.Proxy;
const WeakMap = global.WeakMap;
const Array_isArray = Array.isArray;
const Reflect_apply = Reflect.apply;
const Reflect_construct = Reflect.construct;
const Reflect_getOwnPropertyDescriptor = Reflect.getOwnPropertyDescriptor;
const Reflect_defineProperty = Reflect.defineProperty;
const Reflect_getPrototypeOf = Reflect.getPrototypeOf;
const Reflect_get = Reflect.get;
const WeakMap_prototype_has = WeakMap.prototype.has;
const WeakMap_prototype_get = WeakMap.prototype.get;
const WeakMap_prototype_set = WeakMap.prototype.set;

const inner = (target, key, descriptor) => (
  (!Array.isArray(target) || key !== "length") &&
  (
    "value" in descriptor &&
    (descriptor.writable || descriptor.configurable)));

module.exports = (enter, leave, renter, rleave) => {

  const humans = new WeakMap();
  humans.has = WeakMap_prototype_has;
  humans.get = WeakMap_prototype_get;
  humans.set = WeakMap_prototype_set;

  const wolves = new WeakMap();
  wolves.has = WeakMap_prototype_has;
  wolves.get = WeakMap_prototype_get;
  wolves.set = WeakMap_prototype_set;

  const handlers = {};

  handlers.apply = (target, value, values) => leave(
    Reflect_apply(
      target,
      enter(value),
      ArrayLite.map(values, enter)));

  handlers.construct = (target, values) => leave(
    Reflect_construct(
      target,
      ArrayLite.map(values, enter)));

  handlers.getOwnPropertyDescriptor = (target, key) => {
    const descriptor = Reflect_getOwnPropertyDescriptor(target, key);
    if (descriptor && inner(target, key, descriptor))
      descriptor.value = rleave(descriptor.value);
    return descriptor;
  };

  handlers.defineProperty = (target, key, descriptor) => Reflect_defineProperty(
    target,
    key,
    (
      inner(target, key, descriptor) ?
      {
        value: renter(descriptor.value),
        writable: descriptor.writable,
        enumerable: descriptor.enumerable,
        configurable: descriptor.configurable} :
      descriptor));

  handlers.get = (target, key, receiver) => {
    const descriptor = Reflect_getOwnPropertyDescriptor(target, key);
    if (descriptor) {
      if (inner(target, key, descriptor))
        descriptor.value = rleave(descriptor.value);

      if ("value" in descriptor) {
        if (wolves.has(receiver))
        return (
          descriptor.writable || descriptor.configurable ?
          leave(descriptor.value) :
          stain(descriptor.value));
      if ("get" in descriptor)
        return rleave(Reflect_apply(descriptor.get, rleave(receiver), []));
      return stain(void 0);
    }
    const prototype = Reflect_getPrototypeOf(target);
    if (key === "__proto__")
      return stain(prototype);
    if (wolves.has(receiver))
      return 
    return prototype ? Reflect_get(prototype, key, receiver) : void 0;
  };

  return {
    unturn: (wolf) => humans.get(wolf),
    turn: (human) => wolves.get(human),
    bite: (human) => {
      const wolf = new Proxy(human, handlers);
      humans.set(wolf, human);
      wolves.set(human, wolf);
      return wolf;
    }
  };

};