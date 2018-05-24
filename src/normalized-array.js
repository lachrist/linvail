
const Reflect_get = Reflect.get;
const Reflect_set = Reflect.set;
const Reflect_defineProperty = Reflect.defineProperty;
const Reflect_getOwnPropertyDescriptor = Reflect.getOwnPropertyDescriptor;

module.exports = (membrane, metaof, baseof) => {

  const handlers = {};

  handlers.get = ($target, key, $receiver) => {
    if (key !== "length")
      return Reflect_get($target, key, $receiver);
    return membrane.enter(metaof($target.length));
  };

  handlers.set = ($target, key, $$value, $receiver) => {
    if (key !== "length")
      return Reflect_set($target, key, $$value, $receiver);
    $target.length = baseof(membrane.leave($$value));
    return true;
  };

  handlers.defineProperty = ($target, key, _descriptor) => {
    if (key !== "length")
      return Reflect_defineProperty($target, key, _descriptor);
    $target.length = baseof(membrane.leave(_descriptor.value));
    return true;
  };

  handlers.getOwnPropertyDescriptor = ($target, key) => {
    if (key !== "length")
      return Reflect_getOwnPropertyDescriptor($target, key);
    return {
      value: membrane.enter(metaof($target[key])),
      writable: true,
      enumerable: false,
      configurable: false
    };
  };

  return ($array) => new Proxy($array, handlers); 

};
