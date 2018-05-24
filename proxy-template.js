
const Proxy = global.Proxy;
const WeakMap = global.WeakMap;
const WeakMap_prototype_get = WeakMap.prototype.get;
const WeakMap_prototype_set = WeakMap.prototype.set;
const Array_isArray = Array.isArray;

const Reflect_apply = Reflect.apply;
const Reflect_construct = Reflect.construct;
const Reflect_defineProperty = Reflect.defineProperty;
const Reflect_deleteProperty = Reflect.deleteProperty;
const Reflect_get = Reflect.get;
const Reflect_getOwnPropertyDescriptor = Reflect.getOwnPropertyDescriptor;
const Reflect_getPrototypeOf = Reflect.getPrototypeOf;
const Reflect_has = Reflect.has;
const Reflect_isExtensible = Reflect.isExtensible;
const Reflect_preventExtensions = Reflect.preventExtensions;
const Reflect_ownKeys = Reflect.ownKeys;
const Reflect_set = Reflect.set;
const Reflect_setPrototypeOf = Reflect.setPrototypeOf;

module.exports = (membrane, metaof, baseof) => {

  const handlers = {};

  handlers.apply = (target, value, values) => {
    for (let index = 0, length = values.length; index < length; index++)
      values[index] = membrane.enter(metaof(values[index]));
    return baseof(membrane.leave(Reflect_apply(target.__linvail__, metaof(value), values)));
  };

  handlers.construct = (target, values) => {
    for (let index = 0, length = values.length; index < length; index++)
      values[index] = membrane.enter(metaof(values[index]));
    return baseof(membrane.leave(Reflect_construct(target.__linvail__, values)));
  };

  handlers.defineProperty = (target, key, descriptor) => {
    if ("value" in descriptor) {
      if (key !== "length" || !Array_isArray(target)) {
        descriptor.value = membrane.enter(metaof(descriptor.value));
      }
    } else {
      if ("get" in descriptor)
        descriptor.get = metaof(descriptor.get);
      if ("set" in descriptor)
        descriptor.set = metaof(descriptor.set);
    }
    return Reflect_defineProperty(target.__linvail__, key, descriptor);
  };

  handlers.deleteProperty = (target, key) => Reflect_deleteProperty(target.__linvail__, key);

  handlers.get = (target, key, receiver) => {
    if (key === "__linvail__")
      return target.__linvail__;
    if (key === "length" && Array_isArray(target))
      return target.__linvail__.length;
    const descriptor = Reflect_getOwnPropertyDescriptor(target.__linvail__, key);
    if (descriptor) {
      if ("value" in descriptor) {
        if (descriptor.writable || descriptor.configurable)
          return baseof(membrane.leave(descriptor.value));
        descriptor.value = baseof(membrane.leave(descriptor.value));
        Reflect_defineProperty(target, key, descriptor);
        return descriptor.value;
      }
      if ("get" in descriptor)
        return baseof(membrane.leave(Reflect_apply(descriptor.get, metaof(receiver), [])));
      return void 0;
    }
    const prototype = Reflect_getPrototypeOf(target.__linvail__);
    if (prototype)
      return Reflect_get(baseof(prototype), key, receiver);
    if (key === "__proto__")
      return Reflect_getPrototypeOf(receiver); 
    return void 0;
  };

  handlers.getOwnPropertyDescriptor = (target, key) => {
    const descriptor = Reflect_getOwnPropertyDescriptor(target.__linvail__, key);
    if ("value" in descriptor) {
      if (key !== "length" && !Array_isArray(target)) {
        descriptor.value = baseof(membrane.leave(descriptor.value));
      }
    } else {
      descriptor.get = baseof(descriptor.get);
      descriptor.set = baseof(descriptor.set);
    }
    Reflect_defineProperty(target, key, descriptor);
    return descriptor;
  };

  handlers.getPrototypeOf = (target) => baseof(Reflect_getPrototypeOf(target.__linvail__));

  handlers.has = (target, key) => Reflect_has(target.__linvail__, key);

  handlers.isExtensible = (target) => {
    if (Reflect_isExtensible(target.__linvail__))
      return true;
    if (Reflect_isExtensible(target)) {
      const keys = Reflect_ownKeys(target.__linvail__);
      for (let index = 0, length = keys.length; index < length; index++) {
        if (!Reflect_getOwnPropertyDescriptor(target, keys[index])) {
          Reflect_defineProperty(target, keys[index], {value:null, configurable:true});
        }
      }
      Reflect_preventExtensions(target);
    }
    return false;
  };

  handlers.ownKeys = (target) => {
    if (!Reflect_isExtensible(target)) {
      const keys = Reflect_ownKeys(target);
      for (let index = 0, length = keys.length; index < length; index++) {
        if (!Reflect_getOwnPropertyDescriptor(target.__linvail__, keys[index])) {
          Reflect_deleteProperty(target, keys[index]);
        }
      }
    }
    return Reflect_ownKeys(target.__linvail__);
  }

  handlers.preventExtensions = (target) => Reflect._preventExtensions(target.__linvail__);

  handlers.set = (target, key, value, receiver) => {
    if (key === "length" && Array_isArray(target))
      return (target.__linvail__.length = value, true);
    const descriptor = Reflect_getOwnPropertyDescriptor(target.__linvail__, key);
    if (descriptor) {
      if (descriptor.writable) {
        if (metaof(receiver) === target.__linvail__) {
          descriptor.value = membrane.enter(metaof(value));
          Reflect_defineProperty(target.__linvail__, key, descriptor);
        } else {
          Reflect_defineProperty(receiver, key, {
            value: value,
            writable: true,
            enumerable: true,
            configurable: true
          });
        }
        return true;
      }
      if ("set" in descriptor) {
        Reflect_apply(descriptor.set, metaof(receiver), [membrane.enter(metaof(value))]);
        return true;
      }
      return false;
    }
    const prototype = Reflect_getPrototypeOf(target.__linvail__);
    if (prototype)
      return Reflect_set(baseof(prototype), key, value, receiver);
    if (key === "__proto__")
      return false;
    return Reflect_defineProperty(receiver, key, {
      value: value,
      writable: true,
      enumerable: true,
      configurable: true
    });
  };

  handlers.setPrototypeOf = (target, prototype) => Reflect_setPrototypeOf(target.__linvail__, metaof(prototype));

  const proxies = new WeakMap();
  proxies.get = WeakMap_prototype_get;
  proxies.set = WeakMap_prototype_set;

  return {
    flip: (object) => {
      let proxy = proxies.get(object);
      if (!proxy) {
        const target = Array_isArray(object) ? [] : (typeof object === "function" ? (function () {}) : {});
        const prototype = Object.create(null);
        Reflect_defineProperty(prototype, "__linvail__", {
          value: object,
          writable: false,
          enumerable: false,
          configurable: false
        });
        Reflect_setPrototypeOf(target, prototype);
        proxy = new Proxy(target, handlers);
        proxies.set(object, proxy);
      }
      return proxy;
    },
    unflip: (proxy) => proxy.__linvail__;
  };

};