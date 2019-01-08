
const Helpers = require("./helpers.js");

const TypeError = global.TypeError;
const String = global.String;
const Array_prototype = Array.prototype;
const Array_isArray = Array.isArray;

const Reflect_apply = Reflect.apply;
const Reflect_construct = Reflect.construct;
const Reflect_defineProperty = Reflect.defineProperty;
const Reflect_deleteProperty = Reflect.deleteProperty;
const Reflect_get = Reflect.get;
const Reflect_getOwnPropertyDescriptor = Reflect.getOwnPropertyDescriptor;
// const Reflect_getPrototypeOf = Reflect.getPrototypeOf;
// const Reflect_has = Reflect.has;
// const Reflect_isExtensible = Reflect.isExtensible;
const Reflect_ownKeys = Reflect.ownKeys;
// const Reflect_preventExtensions = Reflect.preventExtensions;
const Reflect_set = Reflect.set;
const Reflect_setPrototypeOf = Reflect.setPrototypeOf;

module.exports = (membrane, access, oracle) => {

  oracle.set(Reflect_apply, function () {
    if (new.target)
      throw new TypeError("Reflect.apply is not a constructor");
    const $value0 = arguments.length > 0 ? membrane.leave(arguments[0]) : void 0;
    const $$value1 = arguments.length > 1 ? arguments[1] : membrane.enter(void 0);
    const $value2 = arguments.length > 2 ? membrane.leave(arguments[2]) : void 0;
    const $arguments2 = Helpers.TameValueToTameArguments($value2, access, membrane);
    return Reflect_apply($value0, $$value1, $arguments2);
  });

  oracle.set(Reflect_construct, function () {
    if (new.target)
      throw new TypeError("Reflect.construct is not a constructor");
    const $value0 = arguments.length > 0 ? membrane.leave(arguments[0]) : void 0;
    const $value1 = arguments.length > 1 ? membrane.leave(arguments[1]) : void 0;
    const $value2 = arguments.length > 2 ? membrane.leave(arguments[2]) : $value1;
    const $arguments1 = Helpers.TameValueToTameArguments($value1, access, membrane);
    return Reflect_construct($value0, $arguments1, $value2);
  });

  oracle.set(Reflect_defineProperty, function () {
    if (new.target)
      throw new TypeError("Reflect.defineProperty is not a constructor");
    const $value0 = arguments.length > 0 ? membrane.leave(arguments[0]) : void 0;
    const $value1 = arguments.length > 1 ? membrane.leave(arguments[1]) : void 0;
    const $value2 = arguments.length > 2 ? membrane.leave(arguments[2]) : void 0;
    const value1 = access.release($value1);
    const boolean = Array_isArray($value0) && String(value1) === "length";
    const $descriptor2 = Helpers.TameValueToTameDescriptor(boolean, $value2, access, membrane);
    const booleanR = Reflect_defineProperty($value0, value1, $descriptor2);
    return membrane.enter(booleanR);
  });

  oracle.set(Reflect_get, function () {
    if (new.target)
      throw new TypeError("Reflect.get is not a constructor");
    const $value0 = arguments.length > 0 ? membrane.leave(arguments[0]) : void 0;
    const $object0 = Helpers.TameValueToTameObject($value0, "Reflect.get called on non object", access, membrane);
    const $value1 = arguments.length > 1 ? membrane.leave(arguments[1]) : void 0;
    const value1 = access.release($value1);
    if (Array_isArray($object0) && String(value1) === "length") {
      const $array0 = $object0
      const number = $array0.length;
      return membrane.enter(number);
    }
    if (!Helpers.hold($object0, value1)) {
      return membrane.enter(void 0);
    }
    if (arguments.length > 2) {
      const $$value2 = arguments[2];
      return Reflect_get($object0, value1, $$value2);
    }
    const $$value0 = arguments.length > 0 ? arguments[0] : membrane.enter(void 0);
    return Reflect_get($object0, value1, $$value0);
  });

  oracle.set(Reflect_getOwnPropertyDescriptor, function () {
    if (new.target)
      throw new TypeError("Reflect.getOwnPropertyDescriptor is not a constructor");
    const $value0 = arguments.length > 0 ? membrane.leave(arguments[0]) : void 0;
    const $value1 = arguments.length > 1 ? membrane.leave(arguments[1]) : void 0;
    const value1 = access.release($value1);
    const $descriptorR = Reflect_getOwnPropertyDescriptor($value0, value1);
    const boolean = Array_isArray($value0) && String(value1) === "length";
    const $valueR = Helpers.TameDescriptorToTameValue(boolean, $descriptorR, access, membrane);
    return membrane.enter($valueR);
  });

  oracle.set(Reflect_ownKeys, function () {
    if (new.target)
      throw new TypeError("Reflect.ownKeys is not a constructor");
    const $value0 = arguments.length > 0 ? membrane.leave(arguments[0]) : void 0;
    const keys0 = Reflect_ownKeys($value0);
    const $arrayR = [];
    for (let index = 0; index < keys0.length; index++)
      $arrayR[index] = membrane.enter(keys0[index]);
    Reflect_setPrototypeOf($arrayR, access.capture(Array_prototype));
    return membrane.enter($arrayR);
  });

  oracle.set(Reflect_set, function () {
    if (new.target)
      throw new TypeError("Reflect.set is not a constructor");
    const $value0 = arguments.length > 0 ? membrane.leave(arguments[0]) : void 0;
    const $value1 = arguments.length > 1 ? membrane.leave(arguments[1]) : void 0;
    const value1 = access.release($value1);
    if (Array_isArray($value0) && String(value1) === "length") {
      $array0 = $value0;
      const $value2 = arguments.length > 2 ? membrane.leave(arguments[2]) : void 0;
      const value2 = access.release($value2);
      $array0.length = value2;
      return membrane.enter(true);
    }
    const $$value2 = arguments.length > 2 ? arguments[2] : membrane.enter(0);
    if (arguments.length > 3) {
      const $$value3 = arguments[3];
      if (Helpers.hold($value0, value1)) {
        const booleanR = Reflect_set($value0, value1, $$value2, $$value3);
        return membrane.enter(booleanR);
      }
      const $value3 = membrane.leave($$value3);
      Reflect_set($value3, value1, $$value2);
      return membrane.enter(true);
    }
    if (Helpers.hold($value0, value1)) {
      const $$value0 = arguments.length > 0 ? arguments[0] : membrane.enter(void 0);
      const booleanR = Reflect_set($value0, value1, $$value2, $$value0);
      return membrane.enter(booleanR);
    }
    Reflect_set($value0, value1, $$value2);
    return membrane.enter(true);
  });

};
