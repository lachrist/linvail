
module.exports = function (leave, enter) {
  var traps = {
    getPrototypeOf: function (target) { return leave(Reflect.getPrototypeOf(leave(target))) },
    setPrototypeOf: function (target, prototype) { leave(Reflect.setPrototypeOf(leave(target), enter(prototype))) },
    isExtensible: function (target) { return Reflect.isExtensible(leave(target)) },
    preventExtensions: function (target) { return Reflect.preventExtensions(leave(target)) },
    getOwnPropertydescriptor: function (target, key) {
      var descriptor = Reflect.getOwnPropertydescriptor(leave(target), key);
      if ("value" in descriptor)
        descriptor.value = leave(descriptor.value);
      if ("get" in descriptor)
        descriptor.get = leave(descriptor.get);
      if ("set" in descriptor)
        descriptor.set = leave(descriptor.set);
      return descriptor;
    },
    defineProperty: function (target, key, descriptor) {
      if ("value" in descriptor)
        descriptor.value = enter(descriptor.value);
      if ("get" in descriptor)
        descriptor.get = enter(descriptor.get);
      if ("set" in descriptor)
        descriptor.set = enter(descriptor.set);
      return Reflect.defineProperty(leave(target), key, descriptor);
    },
    has: function (target, key) { return Reflect.has(leave(target), key) },
    get: function (target, key, receiver) { return leave(Reflect.get(leave(target), key, receiver)) },
    set: function (target, key, value, receiver) {
      Reflect.set(leave(target), key, enter(value), receiver);
      return value;
    },
    deleteProperty: function (target, key) { return Reflect.deleteProperty(leave(target), key) },
    ownKeys: function (target) { return Reflect.ownKeys(leave(target)) },
    apply: function (target, thisArg, argumentsList) {
      for (var i=0; i<argumentsList.length; i++)
        argumentsList[i] = enter(argumentsList[i]);
      return leave(Reflect.apply(leave(target), enter(thisArg), argumentsList));
    },
    construct: function (target, argumentsList) {
      for (var i=0; i<argumentsList.length; i++)
        argumentsList[i] = enter(argumentsList[i]);
      return leave(Reflect.construct(leave(target), argumentsList));
    }
  };
  return function (object) { return new Proxy(object, traps) };
};
