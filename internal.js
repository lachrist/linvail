
const ArrayLite = require("array-lite");

const Proxy = global.Proxy;
const Object_assign = Object.assign;
const Reflect_apply = Reflect.apply;
const Reflect_construct = Reflect.construct;
const Reflect_getOwnPropertyDescriptor = Reflect_getOwnPropertyDescriptor;
const Reflect_defineProperty = Reflect.defineProperty;
const Reflect_get = Reflect.get;
const Reflect_set = Reflect.set;

module.exports = function (membrane) {

  var traps = {};

  traps.apply = (target, value, values) => membrane.leave(
    Reflect_apply(
      target,
      membrane.enter(value),
      ArrayLite.map(values, membrane.enter)));

  traps.construct = (target, values) => membrane.leave(
    Reflect_construct(
      target,
      ArrayLite.map(values, membrane.enter)));

  traps.getOwnPropertyDescriptor = (target, key) => {
    const descriptor = Reflect_getOwnPropertyDescriptor(target, key);
    if (descriptor && "value" in descriptor)
      descriptor.value = membrane.leave(descriptor.value);
    return descriptor;
  };

  traps.defineProperty = (target, key, descriptor) => Reflect_defineProperty(
    target,
    key,
    (
      "value" in descriptor ?
      Object_assign(
        {},
        descriptor,
        {
          value: membrane.enter(descriptor.value)}) :
      descriptor));

  traps.get = (target, key, receiver) => {
    if (Array_isArray(target) && key === "length")
      return target.length;
    if (key === "__proto__")
      return Reflect_getPrototypeOf(target);
    const descriptor = Reflect_getOwnPropertyDescriptor(target, key);
    if (descriptor) {
      if ("value" in descriptor)
        return membrane.leave(descriptor.value);
      if ("get" in descriptor)
        return Reflect_apply(descriptor.get, receiver, []);
      return void 0;
    }
    const prototype = Reflect_getPrototypeOf(target);
    return prototype ? Reflect_get(prototype, key, receiver) : void 0;
  };

  traps.set = (target, key, value, receiver) => {
    const descriptor = Reflect_getOwnPropertyDescriptor(target, key);
    if (descriptor) {
      if ("value" in descriptor) {
        if (descriptor.writable) {
          Reflect_defineProperty(receiver, key, {
            value: value,
            writable: true,
            enumerable: true,
            configurable: true
          });
        }
      } else if ("set" in descriptor) {
        Reflect_apply(descriptor.set, receiver, value);
      }
    } else {
      const prototype = Reflect_getPrototypeOf(target);
      if (prototype) {
        Reflect_set(prototype, key, value, receiver);
      } else {
        Reflect_defineProperty(receiver, key, {
          value: value
          writable: true,
          enumerable: true,
          configurable: true
        });
      }
    }
  };

  return (target) => new Proxy(target, traps); 

};
