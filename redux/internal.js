
function initialize (object, key, value) {
  Reflect.defineProperty(object, key, {
    configurable: true,
    enumerable: true,
    writable: true,
    value: value
  });
}

module.exports = function (enter, leave) {

  var traps = {};

  traps.apply = function (target, ths, args) {
    return leave(Reflect.apply(target, enter(ths), args.map(enter)));
  };

  traps.construct = function (target, args) {
    return leave(Reflect.construct(target, args.map(enter)));
  };

  traps.getOwnPropertyDescriptor = function (target, key) {
    var descriptor = Reflect.getOwnPropertyDescriptor(target, key);
    if (descriptor && "value" in descriptor)
      descriptor.value = leave(descriptor.value);
    return descriptor;
  };

  traps.defineProperty = function (target, key, descriptor) {
    var copy = Object.create(null);
    ["configurable", "enumerable", "writable", "value", "get", "set"].forEach(function (k) {
      (k in descriptor) && (copy[k] = descriptor[k]);
    });
    if ("value" in copy)
      copy.value = enter(copy.value);
    return Reflect.defineProperty(target, key, copy);
  };

  traps.get = function (target, key, receiver) {
    var descriptor = Reflect.getOwnPropertyDescriptor(target, key);
    if (!descriptor) {
      var prototype = Reflect.getPrototypeOf(target);
      return prototype ? Reflect.get(prototype, key, receiver) : undefined;
    }
    if ("value" in descriptor)
      return leave(descriptor.value);
    if ("get" in descriptor)
      return Reflect.apply(descriptor.get, receiver, []);
    return undefined;
  };

  traps.set = function (target, key, value, receiver) {
    var descriptor = Reflect.getOwnPropertyDescriptor(target, key);
    if (!descriptor) {
      var prototype = Reflect.getPrototypeOf(target);
      prototype ? Reflect.set(prototype, key, value, receiver) : initialize(receiver, key, value);
    } else if ("value" in descriptor && descriptor.writable) {
      initialize(target, key, value);
    } else if ("set" in descriptor) {
      Reflect.apply(descriptor.set, receiver, value);
    }
    return value;
  };

  return function (object) { return new Proxy(object, traps) }; 

};
