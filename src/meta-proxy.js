
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

module.exports = (membrane, baseof, metaof) => {

  const objects = new WeakMap();
  objects.get = WeakMap_prototype_get;
  objects.set = WeakMap_prototype_set;

  const handlers = {};

  handlers.apply = (target, value, values) => {
    const object = objects.get(target);
    for (let index = 0, length = values.length; index < length; index++)
      values[index] = baseof(membrane.leave(values[index]));
    return membrane.enter(metaof(Reflect_apply(object, baseof(value), values)));
  };

  handlers.construct = (target, values) => {
    const object = objects.get(target);
    for (let index = 0, length = values.length; index < length; index++)
      values[index] = baseof(membrane.leave(values[index]));
    return membrane.enter(metaof(Reflect_construct(object, values)));
  };

  handlers.defineProperty = (target, key, descriptor) => {
    if ("value" in descriptor) {
      descriptor.value = baseof(membrane.leave(descriptor.value));
    } else {
      if ("get" in descriptor)
        descriptor.get = baseof(descriptor.get);
      if ("set" in descriptor)
        descriptor.set = baseof(descriptor.set);
    }
    return Reflect_defineProperty(objects.get(target), key, descriptor);
  };

  handlers.deleteProperty = (target, key) => Reflect_deleteProperty(objects.get(target), key);

  handlers.get = (target, key, receiver) => {
    const descriptor1 = Reflect_getOwnPropertyDescriptor(target, key);
    if (descriptor1 && "value" in descriptor1 && !descriptor1.configurable && !descriptor1.writable)
      return descriptor1.value;
    const object = objects.get(target);
    const descriptor2 = Reflect_getOwnPropertyDescriptor(object, key);
    if (descriptor2) {
      if ("value" in descriptor2) {
        if (descriptor2.writable || descriptor2.configurable)
          return membrane.enter(metaof(descriptor2.value));
        descriptor2.value = membrane.enter(metaof(descriptor2.value));
        Reflect_defineProperty(target, key, descriptor2);
        return descriptor2.value;
      }
      if ("get" in descriptor2)
        return membrane.enter(metaof(Reflect_apply(descriptor2.get, baseof(receiver), [])));
      return void 0;
    }
    const prototype = Reflect_getPrototypeOf(object);
    if (prototype)
      return Reflect_get(metaof(prototype), key, receiver);
    if (key === "__proto__")
      return Reflect_getPrototypeOf(receiver); 
    return void 0;
  };

  handlers.getOwnPropertyDescriptor = (target, key) => {
    const descriptor1 = Reflect_getOwnPropertyDescriptor(target, key);
    if (descriptor1 && !descriptor1.configurable && !descriptor1.writable)
      return descriptor1;
    const object = objects.get(target);
    const descriptor2 = Reflect_getOwnPropertyDescriptor(object, key);
    if (descriptor2) {
      if ("value" in descriptor2) {
        descriptor2.value = membrane.enter(metaof(descriptor2.value));
      } else {
        descriptor2.get = metaof(descriptor2.get);
        descriptor2.set = metaof(descriptor2.set);
      }
      if (!descriptor2.configurable || (!Reflect_isExtensible(target) && descriptor1)) {
        Reflect_defineProperty(target, key, descriptor2);
      }
    } else if (descriptor1 && Reflect_isExtensible(target)) {
      deleteProperty(target, key);
    }
    return descriptor2;
  };

  handlers.getPrototypeOf = (target) => metaof(Reflect_getPrototypeOf(objects.get(target)));

  handlers.has = (target, key) => {
    if (Reflect_has(objects.get(target), key))
      return true;
    const descriptor = Reflect_getOwnPropertyDescriptor(target, key);
    if (descriptor && (!descriptor.configurable || !Reflect_isExtensible))
      Reflect_deleteProperty(target, key);
    return false;
  };

  handlers.isExtensible = (target) => {
    const object = objects.get(target);
    if (Reflect_isExtensible(object))
      return true;
    if (Reflect_isExtensible(target)) {
      const keys = Reflect_ownKeys(object);
      for (let index = 0, length = keys.length; index < length; index++) {
        if (!Reflect_getOwnPropertyDescriptor(target, keys[index])) {
          Reflect_defineProperty(target, keys[index], {value:null, configurable:true});
        }
      }
      Reflect_setPrototypeOf(target, metaof(Reflect.getPrototypeOf(object)));
      Reflect_preventExtensions(target);
    }
    return false;
  };

  handlers.ownKeys = (target) => {
    const object = objects.get(target);
    if (!Reflect_isExtensible(target)) {
      const keys = Reflect_ownKeys(target);
      for (let index = 0, length = keys.length; index < length; index++) {
        if (!Reflect_getOwnPropertyDescriptor(object, keys[index])) {
          Reflect_deleteProperty(target, keys[index]);
        }
      }
    }
    return Reflect_ownKeys(object);
  };

  handlers.preventExtensions = (target) => Reflect.preventExtensions(objects.get(target));

  handlers.set = (target, key, value, receiver) => {
    const object = objects.get(target);
    const descriptor = Reflect_getOwnPropertyDescriptor(object, key);
    if (descriptor) {
      if (descriptor.writable) {
        if (baseof(receiver) === object) {
          descriptor.value = baseof(membrane.leave(value));
          Reflect_defineProperty(object, key, descriptor);
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
        Reflect_apply(descriptor.set, baseof(receiver), [baseof(membrane.leave(value))]);
        return true;
      }
      return false;
    }
    const prototype = Reflect_getPrototypeOf(object);
    if (prototype)
      return Reflect_set(metaof(prototype), key, value, receiver);
    if (key === "__proto__")
      return false;
    return Reflect_defineProperty(receiver, key, {
      value: value,
      writable: true,
      enumerable: true,
      configurable: true
    });
  };

  handlers.setPrototypeOf = (target, prototype) => Reflect_setPrototypeOf(object, baseof(prototype));

  return (object) => {
    const target = Array_isArray(object) ? [] : (typeof object === "function" ? (function () {}) : {});
    objects.set(target, object);
    return new Proxy(target, handlers);
  };

};