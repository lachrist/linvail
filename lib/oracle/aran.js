
const Helpers = require("./helpers.js");

const Array_prototype = Array.prototype;
const Array_prototype_iterator = Array.prototype[Symbol.iterator];
const Array_isArray = Array.isArray;
const TypeError = global.TypeError;
const Symbol_iterator = Symbol.iterator;
const String = global.String;
const String_prototype_iterator = String.prototype[Symbol.iterator];
const Object_create = Object.create;
const Object_prototype = Object.prototype;
const Reflect_get = Reflect.get
const Reflect_defineProperty = Reflect.defineProperty;
const Reflect_setPrototypeOf = Reflect.setPrototypeOf;

module.exports = (membrane, access, oracle, builtins) => {
  
  oracle.set(builtins["Object.fromEntries"], function () {
    if (new.target)
      throw new TypeError("Object.fromEntries is not a constructor");
    const $$value0 = arguments.length > 0 ? arguments[0] : membrane.taint(void 0);
    const $value0 = arguments.length > 0 ? membrane.clean(arguments[0]) : void 0;
    const $object0 = Helpers.TameValueToTameObject($value0, null, access, membrane);
    const object0 = access.release($object0);
    const iterator0 = object0[Symbol_iterator];
    if (!iterator0 || iterator0 === String_prototype_iterator || iterator0 === Array_prototype_iterator) {
      const length0 = object0.length;
      const $objectR = Object_create(access.capture(Object_prototype));
      for (let index = 0; index < length0; index++) {
        const value = object0[index];
        const $value = access.capture(value);
        const $$value = membrane.taint($value);
        const $object = Helpers.TameValueToTameObject($value, "iterable for Object.fromEntries should have array-like objects", access, membrane);
        const object = access.release($object);
        const first = object[0];
        const $$second = Helpers.Get($object, 1, $$value, access, membrane);
        const $descriptor = Object_create(null);
        $descriptor.value = $$second;
        $descriptor.writable = true;
        $descriptor.enumerable = true;
        $descriptor.configurable = true;
        Reflect_defineProperty($objectR, first, $descriptor);
      }
      return membrane.taint($objectR);
    }
    const objectR = builtins["Object.fromEntries"](object0);
    return membrane.taint(access.capture(objectR));
  });

  oracle.set(builtins.AranEnumerate, function () {
    const $value0 = arguments.length > 0 ? membrane.clean(arguments[0]) : void 0;
    const $arrayR = [];
    for (let key in $value0)
      $arrayR[$arrayR.length] = membrane.taint(key);
    Reflect_setPrototypeOf($arrayR, access.capture(Array_prototype));
    return membrane.taint($arrayR);
  });
  
  oracle.set(builtins.AranDefineDataProperty, function () {
    const $value0 = arguments.length > 0 ? membrane.clean(arguments[0]) : void 0;
    const $value1 = arguments.length > 2 ? membrane.clean(arguments[1]) : void 0;
    const value1 = access.release($value1);
    const $descriptor = Object_create(null);
    if (Array_isArray($value0) && String(value1) === "length") {
      const $value2 = arguments.length > 1 ? membrane.clean(arguments[2]) : void 0;
      const value2 = access.release($value2);
      $descriptor.value = value2;
    } else {
      const $$value2 = arguments.length > 1 ? arguments[2] : membrane.taint(void 0);
      $descriptor.value = $$value2;
    }
    const $value3 = arguments.length > 3 ? membrane.clean(arguments[3]) : void 0;
    const value3 = access.release($value3);
    $descriptor.writable = value3;
    const $value4 = arguments.length > 4 ? membrane.clean(arguments[4]) : void 0;
    const value4 = access.release($value4);
    $descriptor.enumerable = value4;
    const $value5 = arguments.length > 4 ? membrane.clean(arguments[5]) : void 0;
    const value5 = access.release($value5);
    $descriptor.configurable = value5;
    Reflect_defineProperty($value0, value1, $descriptor);
    const $$value0 = arguments.length > 0 ? arguments[0] : membrane.taint(void 0);
    return $$value0;
  });
  
  oracle.set(builtins.AranDefineAccessorProperty, function () {
    const $descriptor = Object_create(null);
    const $value2 = arguments.length > 2 ? membrane.clean(arguments[2]) : void 0;
    $descriptor.get = $value2;
    const $value3 = arguments.length > 3 ? membrane.clean(arguments[3]) : void 0;
    $descriptor.set = $value3;
    const $value4 = arguments.length > 4 ? membrane.clean(arguments[4]) : void 0;
    const value4 = access.release($value4);
    $descriptor.enumerable = value4;
    const $value5 = arguments.length > 4 ? membrane.clean(arguments[5]) : void 0;
    const value5 = access.release($value5);
    $descriptor.configurable = value5;
    const $value0 = arguments.length > 0 ? membrane.clean(arguments[0]) : void 0;
    const $value1 = arguments.length > 2 ? membrane.clean(arguments[1]) : void 0;
    const value1 = access.release($value1);
    Reflect_defineProperty($value0, value1, $descriptor);
    const $$value0 = arguments.length > 0 ? arguments[0] : membrane.taint(void 0);
    return $$value0;
  });

};
