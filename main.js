
const ArrayLite = require("array-lite");
var Internal = require("./internal.js");

const Error = global.Error;
const Object = global.Object;
const Reflect_apply = Reflect.apply;
const Reflect_getOwnPropertyDescriptor = Reflect.getOwnPropertyDescriptor;
const Reflect_getPrototypeOf = Reflect.getPrototypeOf;
const WeakMap_prototype_has = WeakMap.prototype.has;
const WeakMap_prototype_get = WeakMap.prototype.get;
const WeakMap_prototype_set = WeakMap.prototype.set;


module.exports = function (membrane) {

  var internal = Internal(membrane);
  var internals = new WeakMap();
  internals.has = WeakMap_prototype_has;
  internals.get = WeakMap_prototype_get;
  internals.set = WeakMap_prototype_set;

  const internalize = (name) => (value) => {
    var proxy = internal(value);
    internals.set(proxy, value);
    return membrane.enter(proxy, name);
  };

  const enter1 = (name) => (value) => {

  };

  const apply = (value, $value, $values) => (
    internals.has(value1) ?
    Reflect_apply(internals.get(value1), $value2, $values);
    membrane.enter(
      Reflect_apply(
        value1,
        membrane.leave($value2, "this"),
        ArrayLite.map($values, membrane.leave))
      "apply"));

  const get = (value1, value2, $value) => {
    const boolean = internals.has(value1);
    if (boolean)
      value1 = internals.get(value1);
    value1 = Object(value1);
    var descriptor = Reflect_getOwnPropertyDescriptor(value1, value2);
    if (descriptor) {
      if ("value" in descriptor)
        return boolean ? descriptor.value : membrane.enter(descriptor.value, "get");
      if ("get" in descriptor)
        return apply(descriptor.get, $value, []);
      return membrane.enter(void 0, "get");
    }
    const prototype = Reflect_getPrototypeOf(value1);
    return (
      prototype ?
      get(prototype, value2, $value) :
      membrane.enter(void 0, "get"));
  };

  const set = (value1, value2, $value1, $value2, value3) => {
    const boolean = internals.has(value1);
    if (boolean)
      value1 = internals.get(value1);
    value1 = Object(value1);
    const descriptor = Reflect_getOwnPropertyDescriptor(value1, value2);
    if (descriptor) {
      if ("value" in descriptor) {
        if (descriptor.writable) {
          Reflect_defineProperty(value3, value2, {
            value: $value1,
            writable: true,
            enumerable: true,
            configurable: true
          });
        }
      } else if ("set" in descriptor) {
        apply(descriptor.set, $value2, [$value1]);
      }
    } else {
      const prototype = Reflect_getPrototypeOf(value1);
      if (prototype) {
        set(prototype, value2, $value1, $value2, value3);
      } else {
        Reflect_defineProperty(value3, value2, {
          value: $value1,
          writable: true,
          enumerable: true,
          configurable: true
        });
      }
    }
  };

  var p = new Proxy([], {
    set: (target, key, value, receiver) => {
      console.log("set", target, key, value, receiver);
      Reflect.set(target, key, value, receiver);
    },
    defineProperty: (target, key, descriptor) => {
      console.log("define", target, key, descriptor);
      return Reflect.defineProperty(target, key, descriptor);
    }
  });

  // We cannot proxified transparently RegExp:
  // > (new Proxy(/abc/, {})).test("abc")
  // TypeError: Method RegExp.prototype.test called on incompatible receiver [object Object]
  var traps = {};
  traps.primitive = (value, serial) => membrane.enter(value, "primitive");
  traps.array = (value, serial) => {
    const proxy = internal(value);
    return membrane.enter(proxy, "array"); 
  };
  traps["function"] = (value1, serial) => {
    const value2 = {constructor:proxy1};
    const proxy1 = internal(value1);
    const proxy2 = internal(value2);
    internals.set(proxy1, value1);
    internals.set(proxy2, value2);
    Reflect_defineProperty(value1, "length", {
      value: membrane.enter(value1.length, "length"),
      writable: false,
      enumerable: false,
      configurable: true
    });
    Reflect_defineProperty(value1, "name", {
      value: membrane.enter(value1.name, "name"),
      writable: false,
      enumerable: false,
      configurable: true
    });
    value1.prototype = membrane.enter(proxy2, "prototype");
    return membrane.enter(proxy1, "function");
  };
  traps.object = ($properties, serial) => {
    const value = {};
    ArrayLite.forEach(
      $properties,
      ($property, index) => { value[membrane.leave($property[0], index)] = $property[1] });
    const proxy = internal(value);
    return membrane.enter(proxy, "object");
  };
  traps.test = ($value, serial) => membrane.leave($value, "test");
  // TODO
  traps.with = ($value, serial) => {
    membrane.serial = serial;
    const value = membrane.leave($value, "with");
    return internals.has(value) ? internals.get(value) : new Proxy()
    return membrane.leave(o, i, "with")
  };
  traps.eval = ($value, serial) => membrane.weave(membrane.leave($value, "eval"), serial);
  traps.unary = (operator, $value) => {
    switch (operator) {
      case "-":      return membrane.enter(-      membrane.leave($value, "argument"), "unary");
      case "+":      return membrane.enter(+      membrane.leave($value, "argument"), "unary");
      case "!":      return membrane.enter(!      membrane.leave($value, "argument"), "unary");
      case "~":      return membrane.enter(~      membrane.leave($value, "argument"), "unary");
      case "typeof": return membrane.enter(typeof membrane.leave($value, "argument"), "unary");
      case "void":   return membrane.enter(void   membrane.leave($value, "argument"), "unary");
    }
    throw new Error("Unknwon unary operator: "+operator);
  };
  traps.binary = function (operator, $value1, $value2, serial) {
    switch (operator) {
      // Arithmetic
      case "+":          return membrane.enter(membrane.leave($value1, "left") +          membrane.leave($value2, "right"), "binary");
      case "-":          return membrane.enter(membrane.leave($value1, "left") -          membrane.leave($value2, "right"), "binary");
      case "*":          return membrane.enter(membrane.leave($value1, "left") *          membrane.leave($value2, "right"), "binary");
      case "/":          return membrane.enter(membrane.leave($value1, "left") /          membrane.leave($value2, "right"), "binary");
      // Comparison
      case "==":         return membrane.enter(membrane.leave($value1, "left") ==         membrane.leave($value2, "right"), "binary");
      case "!=":         return membrane.enter(membrane.leave($value1, "left") !=         membrane.leave($value2, "right"), "binary");
      case "===":        return membrane.enter(membrane.leave($value1, "left") ===        membrane.leave($value2, "right"), "binary");
      case "!==":        return membrane.enter(membrane.leave($value1, "left") !==        membrane.leave($value2, "right"), "binary");
      case "<":          return membrane.enter(membrane.leave($value1, "left") <          membrane.leave($value2, "right"), "binary");
      case "<=":         return membrane.enter(membrane.leave($value1, "left") <=         membrane.leave($value2, "right"), "binary");
      case ">":          return membrane.enter(membrane.leave($value1, "left") >          membrane.leave($value2, "right"), "binary");
      case ">=":         return membrane.enter(membrane.leave($value1, "left") >=         membrane.leave($value2, "right"), "binary");
      // Object
      case "in":         return membrane.enter(membrane.leave($value1, "left") in         membrane.leave($value2, "right"), "binary");
      case "instanceof": return membrane.enter(membrane.leave($value1, "left") instanceof membrane.leave($value2, "right"), "binary");
      // Bit
      case "<<":         return membrane.enter(membrane.leave($value1, "left") <<         membrane.leave($value2, "right"), "binary");
      case ">>":         return membrane.enter(membrane.leave($value1, "left") >>         membrane.leave($value2, "right"), "binary");
      case ">>>":        return membrane.enter(membrane.leave($value1, "left") >>>        membrane.leave($value2, "right"), "binary");
      case "%":          return membrane.enter(membrane.leave($value1, "left") %          membrane.leave($value2, "right"), "binary");
      case "|":          return membrane.enter(membrane.leave($value1, "left") |          membrane.leave($value2, "right"), "binary");
      case "^":          return membrane.enter(membrane.leave($value1, "left") ^          membrane.leave($value2, "right"), "binary");
      case "&":          return membrane.enter(membrane.leave($value1, "left") &          membrane.leave($value2, "right"), "binary");
    }
    throw new Error("Unknwon binary operator: "+operator);
  };

  traps.apply = (boolean, $value, $values) => apply(
    membrane.leave($value, "function"),
    membrane.enter(boolean ? void 0 : global, "this"),
    $value);

  traps.invoke = ($value1, $value2, $values) => apply(
    membrane.leave($value, "object")[membrane.leave($value, "key")],
    $value1,
    $values);

  traps.construct = ($value, $values) => {
    const value = membrane.leave($value, "constructor");
    return (
      internals.has(value) ?
      Reflect_construct(value, $values) :
      membrane.enter(
        Reflect_construct(
          internals.get(value),
          ArrayLite.map($values, membrane.leave)),
        "construct"));
  };

  traps.get = function (o, k, i) {
    return get(membrane.leave(o, i, "target"), membrane.leave(k, i, "key"), o, i);
  };
  traps.set = function (o, k, v, i) {
    var rr = membrane.leave(o, i, "target");
    set(rr, membrane.leave(k, i, "key"), v, o, rr, i);
    return v;
  };
  traps.delete = function (o, k, i) {
    return membrane.enter(delete membrane.leave(o, i, "target")[membrane.leave(k, i, "key")], i, "result");
  };

  return traps;

};
