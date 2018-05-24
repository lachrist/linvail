
const String = global.String;
const JSON_Stringify = JSON.stringify;
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

// (function () {
//   let o = global;
//   while (o) {
//     console.log("LOOP");
//     for (let k of Reflect.ownKeys(o)) {
//       let d = target.getOwnPropertyDescriptor(o, k);
//       if (!d.writable && !d.configurable) {
//         console.log(k);
//       }
//     }
//     o = target.getPrototypeOf(o);
//   }
// } ());
// LOOP
// Infinity
// NaN
// undefined
// LOOP
// LOOP

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

module.exports = (membrane, metaof, baseof) => {

  const clean = (_values) => {
    const length = _values.length;
    const values = Array(length);
    for (let index = 0; index < length; index++)
      values[index] = baseof(membrane.leave(_values[index]));
    return values;
  };

  const handlers = {};

  handlers.preventExtensions = (_target) => Reflect._preventExtensions(_target.__linvail__);

  handlers.isExtensible = (_target) => {
    if (Reflect.isExtensible(_target.__linvail__))
      return true;
    if (Reflect.isExtensible(_target))
      Reflect.preventExtensions(_target);
    return false;
  };

  handlers.ownKeys = (_target) => Reflect.ownKeys(_target.__linvail__);

  handlers.getPrototypeOf = (_target) => metaof(Reflect_getPrototypeOf(_target.__linvail__));

  handlers.setPrototypeOf = (target, $prototype) => Reflect_setPrototypeOf(target, baseof($prototype));

  handlers.getOwnPropertyDescriptor = ($target, key) => {
    const _descriptor = Reflect_getOwnPropertyDescriptor($target, key);
    if ("value" in _descriptor) {
      _descriptor.value = membrane.enter(metaof(_descriptor.value));
    } else {
      _descriptor.get = metaof(_descriptor.get);
      _descriptor.set = metaof(_descriptor.set);
    }
    return _descriptor;
  };

  handlers.defineProperty = (target, key, _descriptor) => {
    if ("value" in _descriptor) {
      _descriptor.value = baseof(membrane.leave(_descriptor.value));
    } else {
      if ("get" in _descriptor)
        _descriptor.get = baseof(_descriptor.get);
      if ("set" in _descriptor)
        _descriptor.set = baseof(_descriptor.set);
    }
    return Reflect_defineProperty(target, key, _descriptor);
  };

  handlers.apply = (target, $value, _values) => membrane.enter(metaof(Reflect_apply(target, baseof($value), clean(_values))));

  handlers.construct = (target, _values) => membrane.enter(metaof(Reflect_construct(target, clean(_values))));

  handlers.get = (target, key, $receiver) => {
    const descriptor = Reflect_getOwnPropertyDescriptor(target, key);
    if (descriptor) {
      if ("value" in descriptor) {
        const $$value = membrane.enter(metaof(descriptor.value));
        if (descriptor.configurable || descriptor.writable || descriptor.value === $$value)
          return $$value;
        throw new Error("The property "+JSON_Stringify(String(key))+" is not configurable nor writable; due to proxy invariants, the meta proxy cannot return a value different from its base target");
      }
      if ("get" in descriptor)
        return membrane.enter(Reflect_apply(descriptor.get, baseof($receiver), []));
      return membrane.enter(void 0);
    }
    const prototype = Reflect_getPrototypeOf(target);
    if (prototype)
      return Reflect_get(metaof(prototype), key, $receiver);
    if (key === "__proto__")
      return membrane.enter(Reflect_getPrototypeOf($receiver));
    return membrane.enter(void 0);
  };

  handlers.set = (target, key, $$value, $receiver) => {
    const descriptor = Reflect_getOwnPropertyDescriptor(target, key);
    if (descriptor) {
      if (descriptor.writable) {
        if (baseof($receiver) === target) {
          descriptor.value = baseof(membrane.leave($$value));
          Reflect_defineProperty(target, key, descriptor);
        } else {
          Reflect_defineProperty($receiver, key, {
            value: $$value,
            writable: true,
            enumerable: true,
            configurable: true
          });
        }
        return true;
      }
      if ("set" in descriptor) {
        Reflect_apply(descriptor.set, baseof($receiver), [baseof(membrane.leave($$value))]);
        return true;
      }
      return false;
    }
    const prototype = Reflect_getPrototypeOf(target);
    if (prototype)
      return Reflect_set(metaof(prototype), key, $$value, $receiver);
    if (key === "__proto__")
      return false;
    Reflect_defineProperty($receiver, key, {
      value: $$value,
      writable: true,
      enumerable: true,
      configurable: true
    });
    return true;
  };

  const targets = new WeakMap();
  targets.get = WeakMap_prototype_get;
  targets.set = WeakMap_prototype_set;

  const $proxies = new WeakMap();
  $proxies.get = WeakMap_prototype_get;
  $proxies.set = WeakMap_prototype_set;

  return {
    flip: (target) => {
      let $proxy = $proxies.get(target);
      if (!$proxy) {
        $proxy = new Proxy(target, handlers);
        $proxies.set(target, $proxy);
        targets.set($proxy, target);
      }
      return $proxy;
    },
    unflip: ($value) => targets.get($value),
  };

};
