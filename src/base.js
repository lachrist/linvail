
const Object_assign = Object.assign;
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

// In nested proxies (tower of reflection), it can be observed that the getOwnPropertyDescriptor is invoked on the inner proxy.
//
// function Handlers (prefix) {
//   const handlers = {};
//   ["getPrototypeOf", "setPrototypeOf", "isExtensible", "preventExtensions", "apply", "construct"].forEach((name) => {
//     handlers[name] = function () {
//       console.log("begin "+prefix+"."+name);
//       const result = Reflect[name].apply(null, arguments);
//       console.log("end "+prefix+"."+name);
//       return result;
//     };
//   });
//   ["get", "has", "set", "defineProperty", "getOwnPropertyDescriptor", "deleteProperty"].forEach((name) => {
//     handlers[name] = function () {
//       console.log("begin "+prefix+"."+name+" "+String(arguments[1]));
//       const result = Reflect[name].apply(null, arguments);
//       console.log("end "+prefix+"."+name+" "+String(arguments[1]));
//       return result;
//     };
//   });
//   return handlers;
// };
// > var p1 = new Proxy({foo:123}, Handlers("inner"));
// undefined
// > var p2 = new Proxy(p1, Handlers("outer"));
// undefined
// > p2.foo
// begin outer.get foo
// begin inner.get foo
// end inner.get foo
// end outer.get foo
// begin inner.getOwnPropertyDescriptor foo
// end inner.getOwnPropertyDescriptor foo
// 123

module.exports = (membrane, enter, leave) => {

  const targets = new WeakMap();
  targets.get = WeakMap_prototype_get;
  targets.set = WeakMap_prototype_set;

  const proxies = new WeakMap();
  proxies.get = WeakMap_prototype_get;
  proxies.set = WeakMap_prototype_set;

  const handlers = {};

  handlers.getPrototypeOf = (target) => enter(Reflect_getPrototypeOf(target.inner));

  handlers.setPrototypeOf = (target, prototype) => Reflect_setPrototypeOf(target.inner, leave(membrane.enter(prototype)));

  handlers.isExtensible = (target) => Reflect_isExtensible(target.inner);

  handlers.preventExtensions = (target) => Reflect_preventExtensions(target.inner);

  handlers.getOwnPropertyDescriptor = (target, key) => {
    const descriptor = Reflect_getOwnPropertyDescriptor(target.inner, key);
    if (descriptor) {
      descriptor.value = enter(descriptor.value);
      descriptor.configurable = true; // Introduce an Heisenbug to avoid breaking proxy invariant
    }
    return descriptor;
  };

  handlers.defineProperty = (target, key, descriptor) => Reflect_defineProperty(
    target.inner,
    key,
    descriptor);

  handlers.has = (target, key) => Reflect_has(target.inner, key);

  handlers.get = (target, key, receiver) => {
    const descriptor = Reflect_getOwnPropertyDescriptor(target.inner, key);
    if (descriptor) {
      if ("value" in descriptor)
        return enter(descriptor.value);
      if ("get" in descriptor)
        return enter(Reflect_apply(descriptor.get, leave(membrane.enter(receiver)), []));
      return enter(void 0);
    }
    const prototype = Reflect_getPrototypeOf(target.inner);
    if (prototype)
      return Reflect_get(membrane.leave(enter(prototype)), key, receiver);
    return enter(void 0);
  };

  handlers.set = (target, key, value, receiver) => {
    const descriptor = Reflect_getOwnPropertyDescriptor(target.inner, key);
    if (descriptor) {
      if (descriptor.writable) {
        const descriptor = Reflect_getOwnPropertyDescriptor(receiver, key) || {
          writable: true,
          enumerable: true,
          configurable: true
        };
        descriptor.value = leave(value);
        Reflect_defineProperty(receiver, key, descriptor);
        return true;
      }
      if ("set" in descriptor) {
        Reflect_apply(descriptor.set, leave(membrane.enter(receiver)), [leave(value)]);
        return true;
      }
      return false;
    }
    const prototype = Reflect_getPrototypeOf(target.inner);
    if (prototype)
      return Reflect_set(membrane.leave(enter(prototype)), key, value, receiver); 
    Reflect_defineProperty(receiver, key, {
      value: value,
      writable: true,
      enumerable: true,
      configurable: true
    });
    return true;
  };

  handlers.deleteProperty = (target, key) => Reflect_deleteProperty(target.inner, key);

  handlers.ownKeys = (target) => Reflect_ownKeys(target.inner);

  handlers.apply = (target, value, values) => enter(
    Reflect_apply(
      target.inner,
      leave(value),
      map(values, leave)));

  handlers.construct = (target, values) => enter(
    Reflect_construct(
      target.inner,
      map(values, leave)));

  // Targets are wrapped to get rid of the following limitation:
  // TypeError: 'get' on proxy: property 'XXX' is a read-only and non-configurable
  // data property on the proxy target but the proxy did not return its actual value

  return {
    flip: (target) => {
      let proxy = proxies.get(target);
      if (!proxy) {
        const wrapper = (
          typeof target === "function" ?
          function () {} :
          (Array_isArray(target) ? [] : {}));
        wrapper.inner = target;
        proxy = new Proxy(wrapper, handlers);
        proxies.set(target, proxy);
        targets.set(proxy, target);
      }
      return proxy;
    },
    unflip: (proxy) => targets.get(proxy),
  };

};
