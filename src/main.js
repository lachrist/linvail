
const MetaProxy = require("./meta-proxy.js");
const BaseProxy = require("./base-proxy.js");
const NormalizedArray = require("./normalized-array.js");

const String = global.String;
const eval = global.eval;
const Object_create = Object.create;
const Object_prototype = Object.prototype;
const Function_prototype = Function.prototype;
const Array_prototype = Array.prototype;
const Symbol_iterator = Symbol.iterator;

const WeakMap_prototype_get = WeakMap.prototype.get;
const WeakMap_prototype_set = WeakMap.prototype.set;

const Reflect_apply = Reflect.apply;
const Reflect_construct = Reflect.construct;
const Reflect_defineProperty = Reflect.defineProperty;
const Reflect_deleteProperty = Reflect.deleteProperty;
const Reflect_get = Reflect.get;
const Reflect_getOwnPropertyDescriptor = Reflect.getOwnPropertyDescriptor;
const Reflect_getPrototypeOf = Reflect.getPrototypeOf;
const Reflect_has = Reflect.has;
const Reflect_isExtensible = Reflect.isExtensible;
const Reflect_preventExtensions = Reflect.preventExtensions;
const Reflect_ownKeys = Reflect.ownKeys;
const Reflect_set = Reflect.set;
const Reflect_setPrototypeOf = Reflect.setPrototypeOf;

module.exports = (membrane) => {

  const bobjects = new WeakMap();
  bobjects.get = WeakMap_prototype_get;
  bobjects.set = WeakMap_prototype_set;

  const mobjects = new WeakMap();
  mobjects.get = WeakMap_prototype_get;
  mobjects.set = WeakMap_prototype_set;

  const bproxies = new WeakMap();
  bproxies.get = WeakMap_prototype_get;
  bproxies.set = WeakMap_prototype_set;

  const mproxies = new WeakMap();
  mproxies.get = WeakMap_prototype_get;
  mproxies.set = WeakMap_prototype_set;

  const metaof = (value) => {
    if (value && typeof value === "object" || typeof value === "function") {
      const object = mobjects.get(value);
      if (object)
        return object;
      let proxy = mproxies.get(value);
      if (!proxy) {
        proxy = mproxy(value);
        mproxies.set(value, proxy);
        bobjects.set(proxy, value);
      }
      return proxy;
    }
    return value;
  };

  const baseof = (value) => {
    if (value && typeof value === "object" || typeof value === "function") {
      const object = bobjects.get(value);
      if (object)
        return object;
      let proxy = bproxies.get(value);
      if (!proxy) {
        proxy = bproxy(value);
        bproxies.set(value, proxy);
        mobjects.set(proxy, value);
      }
      return proxy;
    }
    return value;
  };

  const mproxy = MetaProxy(membrane, baseof, metaof);

  const bproxy = BaseProxy(membrane, metaof, baseof);

  const narray = NormalizedArray(membrane, metaof, baseof);

  const advice = {SANDBOX:metaof(global)};

  const linvail = {membrane:membrane, metaof:metaof, baseof:baseof, advice:advice};

  ///////////////
  // Producers //
  ///////////////
  advice.arrival = (strict, _arrival, serial) => {
    const _arguments = _arrival.arguments;
    _arrival.arguments.length = membrane.enter(_arrival.arguments.length);
    _arrival.arguments[Symbol_iterator] = membrane.enter(metaof(_arrival.arguments[Symbol_iterator]));
    if (!strict)
      _arrival.arguments.callee = membrane.enter(_arrival.callee);
    Reflect_setPrototypeOf(_arrival.arguments, metaof(Object_prototype));
    return {
      new: membrane.enter(_arrival.new),
      callee: membrane.enter(_arrival.callee),
      this: membrane.enter(_arrival.this === global ? linvail.advice.SANDBOX : _arrival.this),
      arguments: membrane.enter(_arrival.arguments)
    };
  };
  advice.begin = (strict, direct, value, serial) => membrane.enter(linvail.advice.SANDBOX);
  advice.catch = (value, serial) => membrane.enter(metaof(value));
  advice.primitive = (value, serial) => membrane.enter(value);
  advice.discard = (identifier, value, serial) => membrane.enter(value);
  advice.regexp = (value, serial) => membrane.enter(metaof(value));
  advice.closure = (_value, serial) => {
    Reflect_defineProperty(_value, "length", {
      value: membrane.enter(_value.length),
      writable: false,
      enumerable: false,
      configurable: true
    });
    Reflect_defineProperty(_value, "name", {
      value: membrane.enter(_value.name),
      writable: false,
      enumerable: false,
      configurable: true
    });
    Reflect_setPrototypeOf(_value, metaof(Function_prototype));
    if (!("prototype" in _value))
      return membrane.enter(value);
    const $prototype = Object_create(metaof(Object_prototype))
    const $$value = membrane.enter(_value);
    Reflect_defineProperty($prototype, "constructor", {
      value: $$value,
      writable: true,
      enumerable: false,
      configurable: true
    });
    _value.prototype = membrane.enter($prototype);
    return $$value;
  };

  ///////////////
  // Consumers //
  ///////////////
  advice.return = ($arrival, $$value, serial) => {
    if (membrane.leave($arrival.new)) {
      const $value = membrane.leave($$value);
      if (!$value || (typeof $value !== "object" && typeof $value !== "function"))
        return $arrival.this;
    }
    return $$value;
  };
  advice.throw = ($$value, serial) => baseof(membrane.leave($$value));
  advice.success = (strict, direct, $$value, serial) => direct ? $$value : baseof(membrane.leave($$value));
  advice.test = ($$value, serial) => membrane.leave($$value);
  advice.eval = ($$value, serial) => membrane.instrument(String(baseof(membrane.leave($$value))), serial);
  advice.with = ($$value, serial) => membrane.leave($$value);

  ///////////////
  // Combiners //
  ///////////////
  advice.apply = ($$value, _values, serial) => Reflect_apply(membrane.leave($$value), void 0, _values);
  advice.invoke = (value1, value2, values, serial) => {
    const $value1 = membrane.leave(value1);
    return Reflect_apply(membrane.leave($value1[baseof(membrane.leave(value2))]), $value1, values);
  };
  advice.construct = (value, values, serial) => Reflect_construct(membrane.leave(value), values);
  advice.get = (value1, value2, serial) => membrane.leave(value1)[baseof(membrane.leave(value2))];
  advice.set = (value1, value2, value3, serial) => membrane.leave(value1)[baseof(membrane.leave(value2))] = value3;
  advice.delete = (value1, value2) => membrane.enter(delete membrane.leave(value1)[baseof(membrane.leave(value2))]);
  advice.array = (values, serial) => {
    const value = [];
    Reflect_setPrototypeOf(value, metaof(Array_prototype));
    for (let index=0, length=values.length; index < length; index++)
      value[index] = values[index];
    return membrane.enter(narray(value));
  };
  advice.object = (properties, serial) => {
    const value = Object_create(metaof(Object_prototype));
    for (let index=0, length = properties.length; index < length; index++)
      value[baseof(membrane.leave(properties[index][0]))] = properties[index][1];
    return membrane.enter(value);
  };
  advice.unary = (operator, value, serial) => membrane.enter(eval(operator+" baseof(membrane.leave(value))"));
  advice.binary = (operator, value1, value2, serial) => membrane.enter(eval("baseof(membrane.leave(value1)) "+operator+" baseof(membrane.leave(value2))"));

  return linvail;
};
