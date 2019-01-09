
const Helpers = require("./helpers.js");

const RangeError = global.RangeError;
const TypeError = global.TypeError;
const Symbol_iterator = Symbol.iterator;
const String_prototype_iterator = String.prototype[Symbol.iterator];
const Reflect_setPrototypeOf = Reflect.setPrototypeOf;
const Reflect_apply = Reflect.apply;
const Reflect_get = Reflect.get;

const Array = global.Array;
const Array_from = Array.from;
// const Array_isArray = Array.isArray;
const Array_of = Array.of;
const Array_prototype = Array.prototype;
const Array_prototype_iterator = Array.prototype[Symbol.iterator];

module.exports = (membrane, access, oracle) => {

  oracle.set(Array, function () {
    const $value0 = arguments.length > 0 ? membrane.clean(arguments[0]) : void 0;
    if (arguments.length === 1 && typeof $value0 === "number") {
      const $number0 = $value0;
      const $arrayR = Array($number0);
      Reflect_setPrototypeOf($arrayR, access.capture(Array_prototype));
      return membrane.taint($arrayR);
    }
    const $arrayR = Reflect_apply(Array, null, arguments);
    Reflect_setPrototypeOf($arrayR, access.capture(Array_prototype));
    return membrane.taint($arrayR);
  });

  oracle.set(Array_from, function () {
    if (new.target)
      throw new TypeError("Array.from is not a constructor");
    const $value0 = arguments.length > 0 ? membrane.clean(arguments[0]) : void 0;
    const $object0 = Helpers.TameValueToTameObject($value0, null, access, membrane);
    const $$value0 = arguments.length > 0 ? arguments[0] : membrane.taint(void 0);
    if (Helpers.hold($object0, Symbol_iterator)) {
      const iterator0 = Reflect_get($object0, Symbol_iterator, $$value0);
      if (iterator0 !== Array_prototype_iterator && iterator0 !== String_prototype_iterator) {
        const value0 = access.release($value0);
        const arrayR = Array_from(value0);
        const $arrayR = access.capture(arrayR);
        return membrane.taint($arrayR);
      }
    }
    const length0 = Helpers.TameObjectToLength($object0, $$value0, access, membrane);
    const $arrayR = [];
    for (let index = 0; index < length0; index++) {
      if (Helpers.hold($object0, index)) {
        const $$value = Reflect_get($object0, index, $$value0);
        $arrayR[index] = $$value;
      } else {
        $arrayR[index] = membrane.taint(void 0);
      }
    }
    Reflect_setPrototypeOf($arrayR, access.capture(Array_prototype));
    return membrane.taint($arrayR);
  });

  oracle.set(Array_of, function () {
    if (new.target)
      throw new TypeError("Array.of is not a constructor");
    const $arrayR = Reflect_apply(Array_of, null, arguments);
    Reflect_setPrototypeOf($arrayR, access.capture(Array_prototype));
    return membrane.taint($arrayR);
  });

};
