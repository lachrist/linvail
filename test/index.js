
const Linvail = require("../lib/main.js");
const Oracle = require("./oracle");
const Frontier = require("./frontier.js");

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

const membrane = {
  taint: (tame) => ({inner:tame}),
  clean: (wrapper) => {
    if (wrapper === null || typeof wrapper !== "object" || !Reflect.getOwnPropertyDescriptor(wrapper, "inner"))
      throw new TypeError("Not a wrapper: "+wrapper);
    return wrapper.inner;
  }
};
let counter = 0;
const assert = (boolean) => {
  if (!boolean)
    throw new Error("Assertion failure");
  counter++;
};
const access = Linvail(membrane, {check:true, builtins});
const options = {access, membrane, builtins, assert}

Frontier(options);
Oracle(options);

console.log(counter+" assertions passed");
