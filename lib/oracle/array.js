
const Helpers = require("./helpers.js");

const TypeError = global.TypeError;
const Reflect_setPrototypeOf = Reflect.setPrototypeOf;
const Reflect_apply = Reflect.apply;
const Array_from = Array.from;
const Array_of = Array.of;

module.exports = (membrane, access, oracle, sandbox) => {

  const sandbox_Array_prototype = sandbox.Array.prototype;
  const sandbox_String_prototype = sandbox.String.prototype;
  const sandbox_Symbol_iterator = sandbox.Symbol.iterator;
  const sandbox_Array_prototype_iterator = sandbox_Array_prototype[sandbox_Symbol_iterator];
  const sandbox_String_prototype_iterator = sandbox_String_prototype[sandbox_Symbol_iterator];

  oracle.set(sandbox.Array, function () {
    const $value0 = arguments.length > 0 ? membrane.clean(arguments[0]) : void 0;
    if (arguments.length === 1 && typeof $value0 === "number") {
      const $number0 = $value0;
      const $arrayR = Array($number0);
      Reflect_setPrototypeOf($arrayR, access.capture(sandbox_Array_prototype));
      return membrane.taint($arrayR);
    }
    const $arrayR = Reflect_apply(Array, null, arguments);
    Reflect_setPrototypeOf($arrayR, access.capture(sandbox_Array_prototype));
    return membrane.taint($arrayR);
  });

  oracle.set(sandbox.Array.from, function () {
    if (new.target)
      throw new TypeError("Array.from is not a constructor");
    const $$value0 = arguments.length > 0 ? arguments[0] : membrane.taint(void 0);
    const $value0 = arguments.length > 0 ? membrane.clean(arguments[0]) : void 0;
    const $object0 = Helpers.TameValueToTameObject($value0, null, access, membrane);
    const object0 = access.release($object0);
    const iterator0 = object0[sandbox_Symbol_iterator];
    if (!iterator0 || iterator0 === sandbox_Array_prototype_iterator || iterator0 === sandbox_String_prototype_iterator) {
      const length0 = object0.length;
      const $arrayR = [];
      Reflect_setPrototypeOf($arrayR, null);
      for (let index = 0; index < length0; index++)
        $arrayR[index] = Helpers.Get($object0, index, $$value0, access, membrane);
      Reflect_setPrototypeOf($arrayR, access.capture(sandbox_Array_prototype));
      return membrane.taint($arrayR);
    }
    const value0 = access.release($value0);
    const arrayR = Array_from(value0);
    const $arrayR = access.capture(arrayR);
    return membrane.taint($arrayR);
  });

  oracle.set(sandbox.Array.of, function () {
    if (new.target)
      throw new TypeError("Array.of is not a constructor");
    const $arrayR = Reflect_apply(Array_of, null, arguments);
    Reflect_setPrototypeOf($arrayR, access.capture(sandbox_Array_prototype));
    return membrane.taint($arrayR);
  });

};
