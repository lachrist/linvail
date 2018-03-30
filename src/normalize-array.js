
const Object_assign = Object.assign;
const Reflect_get = Reflect.get;
const Reflect_defineProperty = Reflect.defineProperty;
const Reflect_getOwnPropertyDescriptor = Reflect.getOwnPropertyDescriptor;

module.exports = (enter, leave) => {

  const handlers = {};

  handlers.get = (target, key, receiver) => (
    key === "length" ?
    enter(target.length) :
    Reflect_get(target, key, receiver));

  handlers.defineProperty = (target, key, descriptor) => Reflect_defineProperty(
    target,
    key,
    (
      key === "length" ?
      Object_assign(
        {},
        descriptor,
        {
          value:leave(descriptor.value)}) :
      descriptor));

  handlers.getOwnPropertyDescriptor = (target, key) => (
    key === "length" ?
    {
      value: enter(target.length),
      writable: true,
      enumerable: false,
      configurable: false} :
    Reflect_getOwnPropertyDescriptor(target, key));

  return (array) => new Proxy(array, handlers); 

};
