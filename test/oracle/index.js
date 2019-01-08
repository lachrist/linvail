
const Linvail = require("../../lib/main.js");

const builtins = {
  AranDefineDataProperty: function AranDefineDataProperty (object, key, value, writable, enumerable, configurable) {
    const descriptor = {value, writable, enumerable, configurable};
    _Object_setPrototypeOf(descriptor, null);
    return _Object_defineProperty(object, key, descriptor);
  },
  AranDefineAccessorProperty: function AranDefineDataProperty (object, key, get, set, enumerable, configurable) {
    const descriptor = {get, set, enumerable, configurable};
    _Object_setPrototypeOf(descriptor, null);
    return _Object_defineProperty(object, key, descriptor);
  },
  AranEnumerate: function AranEnumerate (object) {
    const keys = [];
    for (let key in object)
      keys[keys.length] = key;
    return keys;
  },
  "Object.fromEntries": function fromEntries (array) {
    const object = _Object_create(null);
    for (let index = 0, length = array.length; index < length; index++)
      object[array[index][0]] = array[index][1];
    return _Object_setPrototypeOf(object, _Object_prototype);
  }
};
    
const linvail = Linvail({
  enter: (tame) => ({inner:tame}),
  leave: (wrapper) => {
    if (wrapper === null || typeof wrapper !== "object" || !Reflect.getOwnPropertyDescriptor(wrapper, "inner"))
      throw new TypeError("Not a wrapper: "+wrapper);
    return wrapper.inner;
  }
}, {check:true, builtins});

linvail.builtins = builtins;

linvail.assert = (boolean) => {
  if (!boolean) {
    throw new Error("Assertion failure");
  }
};

require("./object.js")(linvail);
require("./reflect.js")(linvail);
require("./array.js")(linvail);
require("./aran.js")(linvail);
