
const Reflect_getOwnPropertyDescriptor = Reflect.getOwnPropertyDescriptor;
const Reflect_getPrototypeOf = Reflect.getPrototypeOf;

module.exports = (object, key) => {
  while (object) {
    if (Reflect_getOwnPropertyDescriptor(object, key))
      return true;
    object = Reflect_getPrototypeOf(object);
  }
  return false;
};
