
const Helpers = require("./helpers.js");

const TypeError = global.TypeError;
const Reflect_apply = Reflect.apply;
const Reflect_setPrototypeOf = Reflect.setPrototypeOf;
const Reflect_get = Reflect.get;
const Reflect_set = Reflect.set;
const Array_isArray = Array.isArray;

const Object = global.Object;
const Object_assign = Object.assign;
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
// const Object_seal = Object.seal;
// const Object_setPrototypeOf = Object.setPrototypeOf;
const Object_values = Object.values;

module.exports = (membrane, access, oracle, sandbox) => {
  
  const sandbox_Array_prototype = sandbox.Array.prototype;
  const sandbox_Object_prototype = sandbox.Object.prototype;
  
  oracle.set(sandbox.Object, function () {
    const $value0 = arguments.length > 0 ? membrane.clean(arguments[0]) : void 0;
    if ($value0 === null || $value0 === void 0) {
      const $objectR = {__proto__:acces.capture(sandbox_Object_prototype)};
      return membrane.taint($objectR);
    }
    if (typeof $value0 === "object" || typeof $value0 === "function") {
      const $$value0 = arguments.length > 0 ? arguments[0] : membrane.taint(void 0);
      return $$value0;
    }
    const primitive0 = $value0;
    const $objectR = access.capture(Object(primitive0));
    return membrane.taint($objectR);
  });

  oracle.set(sandbox.Object.assign, function () {
    if (new.target)
      throw new TypeError("Object.assign is not a constructor");
    const $value0 = arguments.length > 0 ? membrane.clean(arguments[0]) : void 0;
    const $object0 = Helpers.TameValueToTameObject($value0, null, access, membrane);
    const $$value0 = arguments.length > 0 ? arguments[0] : membrane.taint(void 0);
    for (let index = 1; index < arguments.length; index++) {
      const $$valueX = arguments[index];
      const $valueX = membrane.clean($$valueX);
      if ($valueX !== null && $valueX !== void 0) {
        const $objectX = Helpers.TameValueToTameObject($valueX, null, access, membrane);
        const keysX = Object_keys($objectX);
        for (let index = 0; index < keysX.length; index++) {
          const $$value = Helpers.Get($objectX, keysX[index], $$valueX, access, membrane);
          if (Array_isArray($object0) && keysX[index] === "length") {
            const $array0 = $object0;
            const value = access.release(membrane.clean($$value));
            $array0.length = value;
          } else {
            Helpers.Set($object0, keysX[index], $$value, $$value0, access, membrane);
          }
        }
      }
    }
    return $$value0;
  });

  oracle.set(sandbox.Object.create, function () {
    if (new.target)
      throw new TypeError("Object.create is not a constructor");
    const $value0 = arguments.length > 0 ? membrane.clean(arguments[0]) : void 0;
    const $objectR = {__proto__:$value0};
    return membrane.taint($objectR);
  });

  oracle.set(sandbox.Object.defineProperties, function () {
    if (new.target)
      throw new TypeError("Object.defineProperties is not a constructor");
    const $value0 = arguments.length > 0 ? membrane.clean(arguments[0]) : void 0;
    const $value1 = arguments.length > 1 ? membrane.clean(arguments[1]) : void 0;
    const $$value1 = arguments.length > 1 ? arguments[1] : membrane.taint(void 0);
    const $object1 = Helpers.TameValueToTameObject($value1);
    const keys1 = Object_keys($object1);
    const $descriptors1 = {__proto__:null};
    for (let index = 0; index < keys1.length; index++) {
      const $value = membrane.clean(Helpers.Get($object1, keys1[index], $$value1, access, membrane));
      const boolean = Array_isArray($value1) && keys1[index] === "length";
      const $descriptor = Helpers.TameValueToTameDescriptor(boolean, $value, access, membrane);
      $descriptors1[keys1[index]] = $descriptor;
    }
    Object_defineProperties($value0, $descriptors1);
    const $$value0 = arguments.length > 0 ? arguments[0] : membrane.taint(void 0);
    return $$value0;
  });

  oracle.set(sandbox.Object.defineProperty, function () {
    if (new.target)
      throw new TypeError("Object.defineProperties is not a constructor");
    const $value0 = arguments.length > 0 ? membrane.clean(arguments[0]) : void 0;
    const $value1 = arguments.length > 1 ? membrane.clean(arguments[1]) : void 0;
    const $value2 = arguments.length > 2 ? membrane.clean(arguments[2]) : void 0;
    const value1 = access.release($value1);
    const boolean = Array_isArray($value0) && String(value1) === "length";
    const $descriptor2 = Helpers.TameValueToTameDescriptor(boolean, $value2, access, membrane);
    Object_defineProperty($value0, value1, $descriptor2);
    const $$value0 = arguments.length > 0 ? arguments[0] : membrane.taint(void 0);
    return $$value0;
  });
  
  oracle.set(sandbox.Object.entries, function () {
    if (new.target)
      throw new TypeError("Object.entries is not a constructor");
    const $value0 = arguments.length > 0 ? membrane.clean(arguments[0]) : void 0;
    const $object0 = Helpers.TameValueToTameObject($value0, null, access, membrane);
    const $arrayR = Object_entries($object0);
    for (let index = 0; index < $arrayR.length; index++) {
      const $array = $arrayR[index];
      const primitive = $array[0];
      $array[0] = membrane.taint(primitive);
      Reflect_setPrototypeOf($array, access.capture(sandbox_Array_prototype));
      $arrayR[index] = membrane.taint($array);      
    }
    Reflect_setPrototypeOf($arrayR, access.capture(sandbox_Array_prototype));
    return membrane.taint($arrayR);
  });

  oracle.set(sandbox.Object.getOwnPropertyDescriptor, function () {
    if (new.target)
      throw new TypeError("Object.getOwnPropertyDescriptor is not a constructor");
    const $value0 = arguments.length > 0 ? membrane.clean(arguments[0]) : void 0;
    const $object0 = Helpers.TameValueToTameObject($value0, null, access, membrane);
    const $value1 = arguments.length > 1 ? membrane.clean(arguments[1]) : void 0;
    const value1 = access.release($value1);
    const $descriptorR = Object_getOwnPropertyDescriptor($object0, value1);
    const boolean = Array_isArray($value0) && String(value1) === "length";
    const $valueR = Helpers.TameDescriptorToTameValue(boolean, $descriptorR, access, membrane, sandbox_Object_prototype);
    return membrane.taint($valueR);
  });

  oracle.set(sandbox.Object.getOwnPropertyDescriptors, function () {
    if (new.target)
      throw new TypeError("Object.getOwnPropertyDescriptor is not a constructor");
    const $value0 = arguments.length > 0 ? membrane.clean(arguments[0]) : void 0;
    const $object0 = Helpers.TameValueToTameObject($value0, null, access, membrane);
    const $descriptorsR = Object_getOwnPropertyDescriptors($object0);
    const $objectR = {__proto__:null};
    const keysR = Object_keys($descriptorsR);
    for (let index = 0; index < keysR.length; index++) {
      const $descriptor = $descriptorsR[keysR[index]];
      const boolean = Array_isArray($value0) && primitives[index] === "length";
      const $value = Helpers.TameDescriptorToTameValue(boolean, $descriptor, access, membrane, sandbox_Object_prototype);
      $objectR[keysR[index]] = membrane.taint($value);
    }
    Reflect_setPrototypeOf($objectR, access.capture(sandbox_Object_prototype));
    return membrane.taint($objectR);
  });

  oracle.set(sandbox.Object.getOwnPropertyNames, function () {
    if (new.target)
      throw new TypeError("Object.getOwnPropertyNames is not a constructor");
    const $value0 = arguments.length > 0 ? membrane.clean(arguments[0]) : void 0;
    const names0 = Object_getOwnPropertyNames($value0);
    const $arrayR = [];
    Reflect_setPrototypeOf($arrayR, null);
    for (let index = 0; index < names0.length; index++)
      $arrayR[index] = membrane.taint(names0[index]);
    Reflect_setPrototypeOf($arrayR, access.capture(sandbox_Array_prototype));
    return membrane.taint($arrayR);
  });
  
  oracle.set(sandbox.Object.getOwnPropertySymbols, function () {
    if (new.target)
      throw new TypeError("Object.getOwnPropertySymbols is not a constructor");
    const $value0 = arguments.length > 0 ? membrane.clean(arguments[0]) : void 0;
    const symbols0 = Object_getOwnPropertySymbols($value0);
    const $arrayR = [];
    Reflect_setPrototypeOf($arrayR, null);
    for (let index = 0; index < symbols0.length; index++)
      $arrayR[index] = membrane.taint(symbols0[index]);
    Reflect_setPrototypeOf($arrayR, access.capture(sandbox_Array_prototype));
    return membrane.taint($arrayR);
  });

  oracle.set(sandbox.Object.keys, function () {
    if (new.target)
      throw new TypeError("Object.keys is not a constructor");
    const $value0 = arguments.length > 0 ? membrane.clean(arguments[0]) : void 0;
    const keys0 = Object_keys($value0);
    const $arrayR = [];
    Reflect_setPrototypeOf($arrayR, null);
    for (let index = 0; index < keys0.length; index++)
      $arrayR[index] = membrane.taint(keys0[index]);
    Reflect_setPrototypeOf($arrayR, access.capture(sandbox_Array_prototype));
    return membrane.taint($arrayR);
  });

  oracle.set(sandbox.Object.values, function () {
    if (new.target)
      throw new TypeError("Object.values is not a constructor");
    const $value0 = arguments.length > 0 ? membrane.clean(arguments[0]) : void 0;
    const $object0 = Helpers.TameValueToTameObject($value0, null, access, membrane);
    const $arrayR = Object_values($object0);
    Reflect_setPrototypeOf($arrayR, access.capture(sandbox_Array_prototype));
    return membrane.taint($arrayR);
  });

};
