
const Helpers = require("./helpers.js");

const TypeError = global.TypeError;
const String = global.String;
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

module.exports = (membrane, access, oracle, sandbox) => {

  const sandbox_Object_prototype = sandbox.Object.prototype;
  const sandbox_Array_prototype = sandbox.Array.prototype;

  oracle.set(sandbox.Reflect.apply, function () {
    if (new.target)
      throw new TypeError("Reflect.apply is not a constructor");
    const $value0 = arguments.length > 0 ? membrane.clean(arguments[0]) : void 0;
    const $$value1 = arguments.length > 1 ? arguments[1] : membrane.taint(void 0);
    const $value2 = arguments.length > 2 ? membrane.clean(arguments[2]) : void 0;
    const $arguments2 = Helpers.TameValueToTameArguments($value2, access, membrane);
    return Reflect_apply($value0, $$value1, $arguments2);
  });

  oracle.set(sandbox.Reflect.construct, function () {
    if (new.target)
      throw new TypeError("Reflect.construct is not a constructor");
    const $value0 = arguments.length > 0 ? membrane.clean(arguments[0]) : void 0;
    const $value1 = arguments.length > 1 ? membrane.clean(arguments[1]) : void 0;
    const $value2 = arguments.length > 2 ? membrane.clean(arguments[2]) : $value1;
    const $arguments1 = Helpers.TameValueToTameArguments($value1, access, membrane);
    return Reflect_construct($value0, $arguments1, $value2);
  });

  oracle.set(sandbox.Reflect.defineProperty, function () {
    if (new.target)
      throw new TypeError("Reflect.defineProperty is not a constructor");
    const $value0 = arguments.length > 0 ? membrane.clean(arguments[0]) : void 0;
    const $value1 = arguments.length > 1 ? membrane.clean(arguments[1]) : void 0;
    const $value2 = arguments.length > 2 ? membrane.clean(arguments[2]) : void 0;
    const value1 = access.release($value1);
    const boolean = Array_isArray($value0) && String(value1) === "length";
    const $descriptor2 = Helpers.TameValueToTameDescriptor(boolean, $value2, access, membrane);
    const booleanR = Reflect_defineProperty($value0, value1, $descriptor2);
    return membrane.taint(booleanR);
  });

  oracle.set(sandbox.Reflect.get, function () {
    if (new.target)
      throw new TypeError("Reflect.get is not a constructor");
    const $value0 = arguments.length > 0 ? membrane.clean(arguments[0]) : void 0;
    const $value1 = arguments.length > 1 ? membrane.clean(arguments[1]) : void 0;
    const value1 = access.release($value1);
    if (arguments.length > 2) {
      const $$value2 = arguments[2];
      return Helpers.Get($value0, value1, $$value2, access, membrane);
    }
    const $$value0 = arguments.length > 0 ? arguments[0] : membrane.taint(void 0);
    return Helpers.Get($value0, value1, $$value0, access, membrane);
  });

  oracle.set(sandbox.Reflect.getOwnPropertyDescriptor, function () {
    if (new.target)
      throw new TypeError("Reflect.getOwnPropertyDescriptor is not a constructor");
    const $value0 = arguments.length > 0 ? membrane.clean(arguments[0]) : void 0;
    const $value1 = arguments.length > 1 ? membrane.clean(arguments[1]) : void 0;
    const value1 = access.release($value1);
    const $descriptorR = Reflect_getOwnPropertyDescriptor($value0, value1);
    const boolean = Array_isArray($value0) && String(value1) === "length";
    const $valueR = Helpers.TameDescriptorToTameValue(boolean, $descriptorR, access, membrane, sandbox_Object_prototype);
    return membrane.taint($valueR);
  });

  oracle.set(sandbox.Reflect.ownKeys, function () {
    if (new.target)
      throw new TypeError("Reflect.ownKeys is not a constructor");
    const $value0 = arguments.length > 0 ? membrane.clean(arguments[0]) : void 0;
    const keys0 = Reflect_ownKeys($value0);
    const $arrayR = [];
    Reflect_setPrototypeOf($arrayR, null);
    for (let index = 0; index < keys0.length; index++)
      $arrayR[index] = membrane.taint(keys0[index]);
    Reflect_setPrototypeOf($arrayR, access.capture(sandbox_Array_prototype));
    return membrane.taint($arrayR);
  });

  oracle.set(sandbox.Reflect.set, function () {
    if (new.target)
      throw new TypeError("Reflect.set is not a constructor");
    const $value0 = arguments.length > 0 ? membrane.clean(arguments[0]) : void 0;
    const $value1 = arguments.length > 1 ? membrane.clean(arguments[1]) : void 0;
    const value1 = access.release($value1);
    const $$value2 = arguments.length > 2 ? arguments[2] : membrane.taint(void 0);
    let booleanR;
    if (arguments.length > 3) {
      const $$value3 = arguments[3];
      booleanR = Helpers.Set($value0, value1, $$value2, $$value3, access, membrane);
    } else {
      const $$value0 = arguments.length > 0 ? arguments[0] : void 0;
      booleanR = Helpers.Set($value0, value1, $$value2, $$value0, access, membrane);
    }
    return membrane.taint(booleanR);
  });

};
