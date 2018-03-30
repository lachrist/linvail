
// object.__proto__ array.length function.prototype regexp.lastIndex
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

module.exports = (instrument, membrane) => {
  const enter = (value) => membrane.enter(
    value && typeof value === "object" || typeof value === "function" ?
    meta.restore(value) || base.flip(value) :
    value);
  const leave = (value) => (value = membrane.leave(value),
    value && typeof value === "object" || typeof value === "function" ?
    base.restore(value) || meta.flip(value) :
    value);
  const narray = NormalizeArray(enter, leave);
  const meta = Meta(membrane, enter, leave);
  const base = Base(membrane, enter, leave);
  const traps = {};
  ///////////////
  // Producers //
  ///////////////
  // TRANSPARENT: read load
  traps.catch = (value, serial) => enter(value);
  traps.primitive = (value, serial) => membrane.enter(value);
  traps.discard = (identifier, value, serial) => membrane.enter(value);
  traps.regexp = (value, serial) => membrane.enter(base.flip(value));
  traps.arrival = (strict, value, serial) => {
    value.callee = membrane.enter(value.callee);
    if (!strict)
      value.arguments.callee = value.callee;
    Reflect_setPrototypeOf(value.arguments, base.flip(Object_prototype));
    value.arguments.length = membrane.enter(value.arguments.length);
    value.arguments[Symbol_iterator] = enter(value.arguments[Symbol_iterator]);
    value.this = value.new ? membrane.enter(value.this) : value.this;
    value.arguments = membrane.enter(value.arguments);
    value.new = membrane.enter(value.new);
    return membrane.enter(value);
  };
  traps["function"] = (value, serial) => {
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
  // TRANSPARENT: declare write return failure completion save
  traps.throw = (value, serial) => leave(value);
  traps.success = (strict, direct, value, serial) => direct ? value : leave(value);
  traps.test = (value, serial) => membrane.leave(value);
  traps.eval = (value, serial) => instrument(String(leave(value)), serial);
  traps.with = (value, serial) => membrane.leave(value);
  ///////////////
  // Combiners //
  ///////////////
  traps.apply = (value1, value2, values, serial) => Reflect_apply(membrane.leave(value1), value2, values);
  traps.invoke = (value1, value2, values, serial) => Reflect_apply(
    membrane.leave(membrane.leave(value1)[leave(value2)]),
    value1,
    values);
  traps.construct = (value, values, serial) => Reflect_construct(membrane.leave(value), values);
  traps.get = (value1, value2, serial) => membrane.leave(value1)[leave(value2)];
  traps.set = (value1, value2, value3, serial) => membrane.leave(value1)[leave(value2)] = value3;
  traps.delete = (value1, value2) => membrane.enter(delete membrane.leave(value1)[leave(value2)]);
  traps.array = (values, serial) => {
    const value = [];
    Reflect_setPrototypeOf(value, base.flip(Array_prototype));
    for (let index=0, length=values.length; index < length; index++)
      value[index] = values[index];
    return membrane.enter(narray(value));
  };
  traps.object = (properties, serial) => {
    const value = Object_create(base.flip(Object_prototype));
    for (let index=0, length = properties.length; index < length; index++)
      value[leave(properties[index][0])] = properties[index][1];
    return membrane.enter(value);
  };
  traps.unary = (operator, value, serial) => membrane.enter(eval(operator+" leave(value)"));
  traps.binary = (operator, value1, value2, serial) => membrane.enter(eval("leave(value1) "+operator+" leave(value2)"));
  ///////////////
  // Interface //
  ///////////////
  global.global = global;
  return {membrane:membrane, traps:traps, base:base, meta:meta, sandbox:base.flip(global)};
};
