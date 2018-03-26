
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

// var p = new Proxy({}, {get: (t,k,r) => (console.log("get",k), Reflect.get(t,k,r)), set: (t,k,v,r) => (console.log("set",k,v), Reflect.set(t,k,v,r)), defineProperty: (t,k,d) => (console.log("def",k,d), Reflect.defineProperty(t,k,d))});

module.exports = (membrane) => {

  const handlers = {};
  const targets = new WeakMap();
  const proxies = new WeakMap();
  targets.has = WeakMap_prototype_has;
  proxies.has = WeakMap_prototype_has;
  targets.get = WeakMap_prototype_get;
  proxies.get = WeakMap_prototype_get;
  targets.set = WeakMap_prototype_set;
  proxies.set = WeakMap_prototype_set;

  const enter = (value) => membrane.enter(targets.has(value) ? targets.get(value) : value);

  const leave = (value) => {
    value = membrane.leave(value);
    if (proxies.has(value))
      return proxies.get(value);
    if (!value || typeof value !== "object" && typeof value !== "function")
      return value;
    const proxy = new Proxy(value, handlers);
    targets.set(proxy, value);
    proxies.set(value, proxy);
    return proxy;
  };

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
    if (descriptor && "value" in descriptor && (!Array_isArray(target) || key !== "length"))
      descriptor.value = leave(descriptor.value);
    return descriptor;
  };

  handlers.defineProperty = (target, key, descriptor) => Reflect_defineProperty(
    target,
    key,
    (
      "value" in descriptor && (!Array_isArray(target) || key !== "length") ?
      {
        value: enter(descriptor.value),
        writable: descriptor.writable,
        enumerable: descriptor.enumerable,
        configurable: descriptor.configurable} :
      descriptor));

  handlers.get = (target, key, receiver) => {
    if (Array_isArray(target) && key === "length")
      return target.length;
    const descriptor = Reflect_getOwnPropertyDescriptor(target, key);
    if (descriptor) {
      if ("value" in descriptor)
        return leave(descriptor.value);
      if ("get" in descriptor)
        return Reflect_apply(descriptor.get, receiver, []);
      return void 0;
    }
    const prototype = Reflect_getPrototypeOf(target);
    if (key === "__proto__")
      return prototype;
    return prototype ? Reflect_get(prototype, key, receiver) : void 0;
  };

  // handlers.set = (target, key, value, receiver) => {
  //   const descriptor = Reflect_getOwnPropertyDescriptor(target, key);
  //   if (descriptor) {
  //     if ("value" in descriptor && descriptor.writable) {
  //       Reflect_defineProperty(receiver, key, {
  //         value: value,
  //         writable: true,
  //         enumerable: true,
  //         configurable: true
  //       });
  //     } else if ("set" in descriptor) {
  //       Reflect_apply(descriptor.set, receiver, [value]);
  //     }
  //   } else if (key === "__proto__") {
  //     Reflect_setPrototypeOf(target, value);
  //   } else {
  //     const prototype = Reflect_getPrototypeOf(target);
  //     if (prototype) {
  //       Reflect_set(prototype, key, value, receiver);
  //     } else {
  //       Reflect_defineProperty(receiver, key, {
  //         value: value,
  //         writable: true,
  //         enumerable: true,
  //         configurable: true
  //       });
  //     }
  //   }
  // };

  return {enter:enter, leave:leave};

};
