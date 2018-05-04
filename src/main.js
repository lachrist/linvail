
const Meta = require("./meta.js");
const Base = require("./base.js");
const NormalizeArray = require("./normalize-array.js");

const String = global.String;
const eval = global.eval;
const Object_create = Object.create;
const Object_prototype = Object.prototype;
const Function_prototype = Function.prototype;
const Array_prototype = Array.prototype;
const Symbol_iterator = Symbol.iterator;

const Reflect_getPrototypeOf = Reflect.getPrototypeOf;
const Reflect_setPrototypeOf = Reflect.setPrototypeOf;
const Reflect_isExtensible = Reflect.isExtensible;
const Reflect_preventExtensions = Reflect.preventExtensions;
const Reflect_getOwnPropertyDescriptor = Reflect.getOwnPropertyDescriptor;
const Reflect_defineProperty = Reflect.defineProperty;
const Reflect_has = Reflect.has;
const Reflect_get = Reflect.get;
const Reflect_set = Reflect.set;
const Reflect_deleteProperty = Reflect.deleteProperty;
const Reflect_ownKeys = Reflect.ownKeys;
const Reflect_apply = Reflect.apply;
const Reflect_construct = Reflect.construct;

module.exports = (membrane) => {
  const enter = (value) => membrane.enter(
    value && typeof value === "object" || typeof value === "function" ?
    meta.unflip(value) || base.flip(value) :
    value);
  const leave = (value) => (value = membrane.leave(value),
    value && typeof value === "object" || typeof value === "function" ?
    base.unflip(value) || meta.flip(value) :
    value);
  const narray = NormalizeArray(enter, leave);
  const meta = Meta(membrane, enter, leave);
  const base = Base(membrane, enter, leave);
  const advice = {SANDBOX:base.flip(global)};
  ///////////////
  // Producers //
  ///////////////
  advice.begin = (strict, direct, value) => enter(value);
  advice.catch = (value, serial) => enter(value);
  advice.primitive = (value, serial) => membrane.enter(value);
  advice.discard = (identifier, value, serial) => membrane.enter(value);
  advice.regexp = (value, serial) => membrane.enter(base.flip(value));
  advice.closure = (value, serial) => {
    Reflect_defineProperty(value, "length", {
      value: membrane.enter(value.length),
      writable: false,
      enumerable: false,
      configurable: true
    });
    Reflect_defineProperty(value, "name", {
      value: membrane.enter(value.name),
      writable: false,
      enumerable: false,
      configurable: true
    });
    Reflect_setPrototypeOf(value, base.flip(Function_prototype));
    if (!("prototype" in value))
      return membrane.enter(value);
    value.prototype = membrane.enter(Object_create(base.flip(Object_prototype)));
    const $value = membrane.enter(value);
    Reflect_defineProperty(membrane.leave(value.prototype), "constructor", {
      value: $value,
      writable: true,
      enumerable: false,
      configurable: true
    });
    return $value;
  };
  ///////////////
  // Consumers //
  ///////////////
  advice.throw = (value, serial) => leave(value);
  advice.success = (strict, direct, value, serial) => direct ? value : leave(value);
  advice.test = (value, serial) => membrane.leave(value);
  advice.eval = (value, serial) => membrane.instrument(String(leave(value)), serial);
  advice.with = (value, serial) => membrane.leave(value);
  ///////////////
  // Combiners //
  ///////////////
  advice.arrival = (strict, value1, value2, value3, value4, serial) => {
    const $value1 = membrane.enter(value1);
    if (!strict)
      value4.callee = $value1;
    Reflect_setPrototypeOf(value4, base.flip(Object_prototype));
    value4.length = membrane.enter(value4.length);
    value4[Symbol_iterator] = enter(value4[Symbol_iterator]);
    return [
      $value1,
      membrane.enter(value2),
      value2 ? membrane.enter(value3) : value3,
      membrane.enter(value4)
    ];
  };
  advice.apply = (value, values, serial) => Reflect_apply(membrane.leave(value), membrane.enter(void 0), values);
  advice.invoke = (value1, value2, values, serial) => Reflect_apply(
    membrane.leave(membrane.leave(value1)[leave(value2)]),
    value1,
    values);
  advice.construct = (value, values, serial) => Reflect_construct(membrane.leave(value), values);
  advice.get = (value1, value2, serial) => membrane.leave(value1)[leave(value2)];
  advice.set = (value1, value2, value3, serial) => membrane.leave(value1)[leave(value2)] = value3;
  advice.delete = (value1, value2) => membrane.enter(delete membrane.leave(value1)[leave(value2)]);
  advice.array = (values, serial) => {
    const value = [];
    Reflect_setPrototypeOf(value, base.flip(Array_prototype));
    for (let index=0, length=values.length; index < length; index++)
      value[index] = values[index];
    return membrane.enter(narray(value));
  };
  advice.object = (properties, serial) => {
    const value = Object_create(base.flip(Object_prototype));
    for (let index=0, length = properties.length; index < length; index++)
      value[leave(properties[index][0])] = properties[index][1];
    return membrane.enter(value);
  };
  advice.unary = (operator, value, serial) => membrane.enter(eval(operator+" leave(value)"));
  advice.binary = (operator, value1, value2, serial) => membrane.enter(eval("leave(value1) "+operator+" leave(value2)"));
  ///////////////
  // Interface //
  ///////////////
  return {membrane:membrane, enter:enter, leave:leave, advice:advice, base:base, meta:meta};
};