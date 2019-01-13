
const Hold = require("../hold.js");
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
    if (Hold($object0, Symbol_iterator)) {
      const $$iterator0 = Reflect_get($object0, Symbol_iterator, $$value0);
      const iterator0 = access.release(membrane.clean($$iterator0));
      if (iterator0 === String_prototype_iterator || iterator0 === Array_prototype_iterator) {
        const length0 = Helpers.TameObjectToLength($object0, $$value0, access, membrane);
        const $objectR = Object_create(null);
        for (let index = 0; index < length0; index++) {
          if (Hold($object0, index)) {
            const $$value = Reflect_get($object0, index, $$value0);
            const $value = membrane.clean($$value);
            const $object = Helpers.TameValueToTameObject($value, "iterable for Object.fromEntries should have array-like objects", access, membrane);
            let first;
            if (Hold($object, 0)) {
              const $$first = Reflect_get($object, 0, $$value);
              first = access.release(membrane.clean($$first));
            } else {
              first = void 0;
            }
            let $$second;
            if (Hold($object, 1)) {
              $$second = Reflect_get($object, 1, $$value);
            } else {
              $$second = membrane.taint(void 0);
            }
            $objectR[first] = $$second;
          }
        }
        Reflect_setPrototypeOf($objectR, access.capture(Object_prototype));
        return membrane.taint($objectR);
      }
    }
    const object0 = access.release($object0);
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
