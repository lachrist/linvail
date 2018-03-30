
const Array_isArray = Array.isArray;
const Proxy = global.Proxy;
const WeakMap = global.WeakMap;
const WeakMap_prototype_get = WeakMap.prototype.get;
const WeakMap_prototype_set = WeakMap.prototype.set;

const Reflect_getPrototypeOf = Reflect.getPrototypeOf;
const Reflect_setPrototypeOf = Reflect.setPrototypeOf;
const Reflect_isExtensible = Reflect.isExtensible;
const Reflect_preventExtensions = Reflect.preventExtensions;
const Reflect_getOwnPropertyDescriptor = Reflect.getOwnPropertyDescriptor;
const Reflect_defineProperty = Reflect.defineProperty;
const Reflect_has = Reflect.has;
const Reflect_get = Reflect.get;
const Reflect_set = Reflect.set;
const Reflect_deleteProperty = Reflect.deleteProperty;
const Reflect_ownKeys = Reflect.ownKeys;
const Reflect_apply = Reflect.apply;
const Reflect_construct = Reflect.construct;

const map = (array, arrow) => {
  const result = [];
  for (let index = 0, length = array.length; index < length; index++)
    result[index] = arrow(array[index]);
  return result;
};

module.exports = (membrane, enter, leave) => {

  const targets = new WeakMap();
  targets.get = WeakMap_prototype_get;
  targets.set = WeakMap_prototype_set;

  const proxies = new WeakMap();
  proxies.get = WeakMap_prototype_get;
  proxies.set = WeakMap_prototype_set;

  const handlers = {};

  handlers.getPrototypeOf = (target) => leave(membrane.enter(Reflect_getPrototypeOf(target)));

  handlers.setPrototypeOf = (target, prototype) => Reflect_setPrototypeOf(target, enter(prototype));

  handlers.getOwnPropertyDescriptor = (target, key) => {
    const descriptor = Reflect_getOwnPropertyDescriptor(target, key);
    descriptor.value = leave(descriptor.value);
    return descriptor;
  };

  handlers.defineProperty = (target, key, descriptor) => Reflect_defineProperty(
    target,
    key,    
    {
      value: enter(descriptor.value),
      writable: descriptor.writable,
      enumerable: descriptor.enumerable,
      configurable: descriptor.configurable});

  handlers.get = (target, key, receiver) => {
    const descriptor = Reflect_getOwnPropertyDescriptor(target, key);
    if (descriptor) {
      if ("value" in descriptor)
        return leave(descriptor.value);
      if ("get" in descriptor)
        return Reflect_apply(descriptor.get, receiver, []);
      return void 0;
    }
    const prototype = Reflect_getPrototypeOf(target);
    if (prototype)
      return Reflect_get(leave(membrane.enter(prototype)), key, receiver);
    return void 0;
  };

  handlers.set = (target, key, value, receiver) => {
    const descriptor = Reflect_getOwnPropertyDescriptor(target, key);
    if (descriptor) {
      if (descriptor.writable) {
        const descriptor = Reflect_getOwnPropertyDescriptor(receiver) || {
          writable: true,
          enumerable: true,
          configurable: true
        };
        descriptor.value = value;
        Reflect_defineProperty(receiver, key, descriptor);
        return true;
      }
      if ("set" in descriptor) {
        Reflect_apply(descriptor.set, receiver, [value]);
        return true;
      }
      return false;
    }
    const prototype = Reflect_getPrototypeOf(target);
    if (prototype)
      return Reflect_set(leave(membrane.enter(prototype)), key, value, receiver);
    return Reflect_defineProperty(receiver, key, {
      value: value,
      writable: true,
      enumerable: true,
      configurable: true
    });
  };

  handlers.apply = (target, value, values) => leave(
    Reflect_apply(
      target,
      enter(value),
      map(values, enter)));

  handlers.construct = (target, values) => leave(
    Reflect_construct(
      target,
      map(values, enter)));

  return {
    restore: (proxy) => targets.get(proxy),
    flip: (target) => {
      let proxy = proxies.get(target);
      if (!proxy) {
        proxy = new Proxy(target, handlers);
        targets.set(proxy, target);
        proxies.set(target, proxy);
      }
      return proxy;
    }
  };

};