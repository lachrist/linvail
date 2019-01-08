
const Helpers = require("./helpers.js");

const TypeError = global.TypeError;
const Reflect_apply = Reflect.apply;
const Reflect_setPrototypeOf = Reflect.setPrototypeOf;
const Reflect_get = Reflect.get;
const Reflect_set = Reflect.set;
const Array_prototype = Array.prototype;
const Array_isArray = Array.isArray;

const Object = global.Object;
const Object_assign = Object.assign;
const Object_create = Object.create;
const Object_defineProperties = Object.defineProperties;
const Object_defineProperty = Object.defineProperty;
const Object_entries = Object.entries;
// const Object_freeze = Object.freeze;
// const Object_fromEntries = Object.fromEntries;
const Object_getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
const Object_getOwnPropertyDescriptors = Object.getOwnPropertyDescriptors;
const Object_getOwnPropertyNames = Object.getOwnPropertyNames;
const Object_getOwnPropertySymbols = Object.getOwnPropertySymbols;
// const Object_getPrototypeOf = Object.getPrototypeOf;
// const Object_is = Object.is;
// const Object_isExtensible = Object.isExtensible;
// const Object_isFrozen = Object.isFrozen;
// const Object_isSealed = Object.isSealed;
const Object_keys = Object.keys;
// const Object_preventExtensions = Object.preventExtensions;
const Object_prototype = Object.prototype;
// const Object_seal = Object.seal;
// const Object_setPrototypeOf = Object.setPrototypeOf;
const Object_values = Object.values;

module.exports = (membrane, access, oracle) => {
  
  oracle.set(Object, function () {
    const $value0 = arguments.length > 0 ? membrane.leave(arguments[0]) : void 0;
    if ($value0 === null || $value0 === void 0) {
      const $objectR = Object_create(acces.capture(Object_prototype));
      return membrane.enter($objectR);
    }
    if (typeof $value0 === "object" || typeof $value0 === "function") {
      const $$value0 = arguments.length > 0 ? arguments[0] : membrane.enter(void 0);
      return $$value0;
    }
    const primitive0 = $value0;
    const $objectR = access.capture(Object(primitive0));
    return membrane.enter($objectR);
  });

  oracle.set(Object_assign, function () {
    if (new.target)
      throw new TypeError("Object.assign is not a constructor");
    const $value0 = arguments.length > 0 ? membrane.leave(arguments[0]) : void 0;
    const $object0 = Helpers.TameValueToTameObject($value0, null, access, membrane);
    const $$value0 = arguments.length > 0 ? arguments[0] : membrane.enter(void 0);
    for (let index = 1; index < arguments.length; index++) {
      const $$valueX = arguments[index];
      const $valueX = membrane.leave($$valueX);
      if ($valueX !== null && $valueX !== void 0) {
        const $objectX = Helpers.TameValueToTameObject($valueX, null, access, membrane);
        const keysX = Object_keys($objectX);
        for (let index = 0; index < keysX.length; index++) {
          const $$value = Reflect_get($objectX, keysX[index], $$valueX)
          if (Array_isArray($object0) && keysX[index] === "length") {
            const $array0 = $object0;
            const value = access.release(membrane.leave($$value));
            $array0.length = value;
          } else if (Helpers.hold($object0, keysX[index])) {
            Reflect_set($object0, keysX[index], $$value, $$value0);
          } else {
            $object0[keysX[index]] = $$value;
          }
        }
      }
    }
    return $$value0;
  });

  oracle.set(Object_create, function () {
    if (new.target)
      throw new TypeError("Object.create is not a constructor");
    const $value0 = arguments.length > 0 ? membrane.leave(arguments[0]) : void 0;
    const $objectR = Object_create($value0);
    return membrane.enter($objectR);
  });

  oracle.set(Object_defineProperties, function () {
    if (new.target)
      throw new TypeError("Object.defineProperties is not a constructor");
    const $value0 = arguments.length > 0 ? membrane.leave(arguments[0]) : void 0;
    const $value1 = arguments.length > 1 ? membrane.leave(arguments[1]) : void 0;
    const keys1 = Object_keys($value1);
    const $descriptors1 = Object_create(null);
    for (let index = 0; index < keys1.length; index++) {
      const $value = membrane.leave($value1[keys1[index]]);
      const boolean = Array_isArray($value1) && keys1[index] === "length";
      const $descriptor = Helpers.TameValueToTameDescriptor(boolean, $value, access, membrane);
      $descriptors1[keys1[index]] = $descriptor;
    }
    Object_defineProperties($value0, $descriptors1);
    const $$value0 = arguments.length > 0 ? arguments[0] : membrane.enter(void 0);
    return $$value0;
  });

  oracle.set(Object_defineProperty, function () {
    if (new.target)
      throw new TypeError("Object.defineProperties is not a constructor");
    const $value0 = arguments.length > 0 ? membrane.leave(arguments[0]) : void 0;
    const $value1 = arguments.length > 1 ? membrane.leave(arguments[1]) : void 0;
    const $value2 = arguments.length > 2 ? membrane.leave(arguments[2]) : void 0;
    const value1 = access.release($value1);
    const boolean = Array_isArray($value0) && String(value1) === "length";
    const $descriptor2 = Helpers.TameValueToTameDescriptor(boolean, $value2, access, membrane);
    Object_defineProperty($value0, value1, $descriptor2);
    const $$value0 = arguments.length > 0 ? arguments[0] : membrane.enter(void 0);
    return $$value0;
  });
  
  oracle.set(Object_entries, function () {
    if (new.target)
      throw new TypeError("Object.entries is not a constructor");
    const $value0 = arguments.length > 0 ? membrane.leave(arguments[0]) : void 0;
    const $object0 = Helpers.TameValueToTameObject($value0, null, access, membrane);
    const $arrayR = Object_entries($object0);
    for (let index = 0; index < $arrayR.length; index++) {
      const $array = $arrayR[index];
      const primitive = $array[0];
      $array[0] = membrane.enter(primitive);
      Reflect_setPrototypeOf($array, access.capture(Array_prototype));
      $arrayR[index] = membrane.enter($array);      
    }
    Reflect_setPrototypeOf($arrayR, access.capture(Array_prototype));
    return membrane.enter($arrayR);
  });

  oracle.set(Object_getOwnPropertyDescriptor, function () {
    if (new.target)
      throw new TypeError("Object.getOwnPropertyDescriptor is not a constructor");
    const $value0 = arguments.length > 0 ? membrane.leave(arguments[0]) : void 0;
    const $object0 = Helpers.TameValueToTameObject($value0, null, access, membrane);
    const $value1 = arguments.length > 1 ? membrane.leave(arguments[1]) : void 0;
    const value1 = access.release($value1);
    const $descriptorR = Object_getOwnPropertyDescriptor($object0, value1);
    const boolean = Array_isArray($value0) && String(value1) === "length";
    const $valueR = Helpers.TameDescriptorToTameValue(boolean, $descriptorR, access, membrane);
    return membrane.enter($valueR);
  });

  oracle.set(Object_getOwnPropertyDescriptors, function () {
    if (new.target)
      throw new TypeError("Object.getOwnPropertyDescriptor is not a constructor");
    const $value0 = arguments.length > 0 ? membrane.leave(arguments[0]) : void 0;
    const $object0 = Helpers.TameValueToTameObject($value0, null, access, membrane);
    const $descriptorsR = Object_getOwnPropertyDescriptors($object0);
    const $objectR = Object_create(null);
    const keysR = Object_keys($descriptorsR);
    for (let index = 0; index < keysR.length; index++) {
      const $descriptor = $descriptorsR[keysR[index]];
      const boolean = Array_isArray($value0) && primitives[index] === "length";
      const $value = Helpers.TameDescriptorToTameValue(boolean, $descriptor, access, membrane);
      $objectR[keysR[index]] = membrane.enter($value);
    }
    Reflect_setPrototypeOf($objectR, access.capture(Object_prototype));
    return membrane.enter($objectR);
  });

  oracle.set(Object_getOwnPropertyNames, function () {
    if (new.target)
      throw new TypeError("Object.getOwnPropertyNames is not a constructor");
    const $value0 = arguments.length > 0 ? membrane.leave(arguments[0]) : void 0;
    const names0 = Object_getOwnPropertyNames($value0);
    const $arrayR = [];
    for (let index = 0; index < names0.length; index++)
      $arrayR[index] = membrane.enter(names0[index]);
    Reflect_setPrototypeOf($arrayR, access.capture(Array_prototype));
    return membrane.enter($arrayR);
  });
  
  oracle.set(Object_getOwnPropertySymbols, function () {
    if (new.target)
      throw new TypeError("Object.getOwnPropertySymbols is not a constructor");
    const $value0 = arguments.length > 0 ? membrane.leave(arguments[0]) : void 0;
    const symbols0 = Object_getOwnPropertySymbols($value0);
    const $arrayR = [];
    for (let index = 0; index < symbols0.length; index++)
      $arrayR[index] = membrane.enter(symbols0[index]);
    Reflect_setPrototypeOf($arrayR, access.capture(Array_prototype));
    return membrane.enter($arrayR);
  });

  oracle.set(Object_keys, function () {
    if (new.target)
      throw new TypeError("Object.keys is not a constructor");
    const $value0 = arguments.length > 0 ? membrane.leave(arguments[0]) : void 0;
    const keys0 = Object_keys($value0);
    const $arrayR = [];
    for (let index = 0; index < keys0.length; index++)
      $arrayR[index] = membrane.enter(keys0[index]);
    Reflect_setPrototypeOf($arrayR, access.capture(Array_prototype));
    return membrane.enter($arrayR);
  });

  oracle.set(Object_values, function () {
    if (new.target)
      throw new TypeError("Object.values is not a constructor");
    const $value0 = arguments.length > 0 ? membrane.leave(arguments[0]) : void 0;
    const $object0 = Helpers.TameValueToTameObject($value0, null, access, membrane);
    const $arrayR = Object_values($object0);
    Reflect_setPrototypeOf($arrayR, access.capture(Array_prototype));
    return membrane.enter($arrayR);
  });

};
