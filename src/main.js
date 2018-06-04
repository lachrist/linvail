
const MetaProxy = require("./meta-proxy.js");
const BaseProxy = require("./base-proxy.js");
const NormalizedArray = require("./normalized-array.js");

const Error = global.Error;
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
  advice.arrival = (strict, _scope, serial) => {
    const _arguments = _scope.arguments;
    _scope.arguments.length = membrane.enter(_scope.arguments.length);
    _scope.arguments[Symbol_iterator] = membrane.enter(metaof(_scope.arguments[Symbol_iterator]));
    if (!strict)
      _scope.arguments.callee = membrane.enter(_scope.callee);
    Reflect_setPrototypeOf(_scope.arguments, metaof(Object_prototype));
    return {
      new: membrane.enter(_scope.new),
      callee: membrane.enter(_scope.callee),
      this: membrane.enter(_scope.this === global ? linvail.advice.SANDBOX : _scope.this),
      arguments: membrane.enter(_scope.arguments)
    };
  };
  advice.begin = (strict, scope, serial) => {
    if (scope) {
      for (var key in scope) {
        scope[key] = membrane.enter(key);
      }
    }
    return scope;
  }
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
  advice.return = ($scope, $$value, serial) => {
    if (membrane.leave($scope.new)) {
      const $value = membrane.leave($$value);
      if (!$value || (typeof $value !== "object" && typeof $value !== "function"))
        return $scope.this;
    }
    return $$value;
  };
  advice.throw = ($$value, serial) => baseof(membrane.leave($$value));
  advice.success = ($scope, $$value, serial) => $scope ? baseof(membrane.leave($$value)) : $$value;
  advice.test = ($$value, serial) => membrane.leave($$value);
  advice.eval = ($$value, serial) => membrane.instrument(String(baseof(membrane.leave($$value))), serial);
  advice.with = ($$value, serial) => membrane.leave($$value);

  ///////////////
  // Combiners //
  ///////////////
  advice.apply = ($$value, array$$value, serial) => {
    switch (array$$value.length) {
      case 0: return membrane.leave($$value)();
      case 1: return membrane.leave($$value)(array$$value[0]);
      case 2: return membrane.leave($$value)(array$$value[0], array$$value[1]);
      case 3: return membrane.leave($$value)(array$$value[0], array$$value[1], array$$value[2]);
    }
    return Reflect_apply(membrane.leave($$value), void 0, array$$value);
  };
  advice.invoke = ($$value1, $$value2, array$$value, serial) => {
    const $value1 = membrane.leave($$value1);
    return Reflect_apply(membrane.leave($value1[baseof(membrane.leave($$value2))]), $value1, array$$value);
  };
  advice.construct = ($$value, array$$value, serial) => {
    switch (array$$value.length) {
      case 0: return new (membrane.leave($$value))();
      case 1: return new (membrane.leave($$value))(array$$value[0]);
      case 2: return new (membrane.leave($$value))(array$$value[0], array$$value[1]);
      case 3: return new (membrane.leave($$value))(array$$value[0], array$$value[1], array$$value[2]);
    }
    return Reflect_construct(membrane.leave($$value), array$$value);
  };
  advice.get = ($$value1, $$value2, serial) => {
    const $value1 = membrane.leave($$value1);
    const value2 = baseof(membrane.leave($$value2));
    if ($value1 && (typeof $value1 === "object" || typeof $value1 === "function"))
      return $value1[value2];
    return membrane.enter($value1[value2]);
  }
  advice.set = ($$value1, $$value2, $$value3, serial) => membrane.leave($$value1)[baseof(membrane.leave($$value2))] = $$value3;
  advice.delete = ($$value1, $$value2) => membrane.enter(delete membrane.leave($$value1)[baseof(membrane.leave($$value2))]);
  advice.array = (array$$value, serial) => {
    const $$value = [];
    Reflect_setPrototypeOf($$value, metaof(Array_prototype));
    for (let index=0, length=array$$value.length; index < length; index++)
      $$value[index] = array$$value[index];
    return membrane.enter(narray($$value));
  };
  advice.object = (_properties, serial) => {
    const value = Object_create(metaof(Object_prototype));
    for (let index=0, length = _properties.length; index < length; index++)
      value[baseof(membrane.leave(_properties[index][0]))] = _properties[index][1];
    return membrane.enter(value);
  };
  advice.unary = (operator, $$value, serial) => {
    switch (operator) {
      case "-":      return membrane.enter(-      baseof(membrane.leave($$value)));
      case "+":      return membrane.enter(+      baseof(membrane.leave($$value)));
      case "!":      return membrane.enter(!      baseof(membrane.leave($$value)));
      case "~":      return membrane.enter(~      baseof(membrane.leave($$value)));
      case "typeof": return membrane.enter(typeof baseof(membrane.leave($$value)));
      case "void":   return membrane.enter(void   baseof(membrane.leave($$value)));
    }
    throw new Error("Unknown unary operator: "+operator);
  };
  advice.binary = (operator, $$value1, $$value2, serial) => {
    switch (operator) {
      case "==":  return membrane.enter(baseof(membrane.leave($$value1)) ==  baseof(membrane.leave($$value2)));
      case "!=":  return membrane.enter(baseof(membrane.leave($$value1)) !=  baseof(membrane.leave($$value2)));
      case "===": return membrane.enter(baseof(membrane.leave($$value1)) === baseof(membrane.leave($$value2)));
      case "!==": return membrane.enter(baseof(membrane.leave($$value1)) !== baseof(membrane.leave($$value2)));
      case "<":   return membrane.enter(baseof(membrane.leave($$value1)) <   baseof(membrane.leave($$value2)));
      case "<=":  return membrane.enter(baseof(membrane.leave($$value1)) <=  baseof(membrane.leave($$value2)));
      case ">":   return membrane.enter(baseof(membrane.leave($$value1)) >   baseof(membrane.leave($$value2)));
      case ">=":  return membrane.enter(baseof(membrane.leave($$value1)) >=  baseof(membrane.leave($$value2)));
      case "<<":  return membrane.enter(baseof(membrane.leave($$value1)) <<  baseof(membrane.leave($$value2)));
      case ">>":  return membrane.enter(baseof(membrane.leave($$value1)) >>  baseof(membrane.leave($$value2)));
      case ">>>": return membrane.enter(baseof(membrane.leave($$value1)) >>> baseof(membrane.leave($$value2)));
      case "+":   return membrane.enter(baseof(membrane.leave($$value1)) +   baseof(membrane.leave($$value2)));
      case "-":   return membrane.enter(baseof(membrane.leave($$value1)) -   baseof(membrane.leave($$value2)));
      case "*":   return membrane.enter(baseof(membrane.leave($$value1)) *   baseof(membrane.leave($$value2)));
      case "/":   return membrane.enter(baseof(membrane.leave($$value1)) /   baseof(membrane.leave($$value2)));
      case "%":   return membrane.enter(baseof(membrane.leave($$value1)) %   baseof(membrane.leave($$value2)));
      case "|":   return membrane.enter(baseof(membrane.leave($$value1)) |   baseof(membrane.leave($$value2)));
      case "^":   return membrane.enter(baseof(membrane.leave($$value1)) ^   baseof(membrane.leave($$value2)));
      case "&":   return membrane.enter(baseof(membrane.leave($$value1)) &   baseof(membrane.leave($$value2)));
      case "in":  return membrane.enter(baseof(membrane.leave($$value1)) in  baseof(membrane.leave($$value2)));
      case "instanceof": return membrane.enter(baseof(membrane.leave($$value1)) instanceof baseof(membrane.leave($$value2)));
    }
    throw new Error("Unknown binary operator: "+operator);
  };

  return linvail;

};
