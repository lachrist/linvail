
// object.__proto__ array.length function.prototype
const Transitive = require("./transitive.js");

const String = global.String;
const Reflect_apply = Reflect.apply;
const Reflect_construct = Reflect.construct;
const Reflect_defineProperty = Reflect.defineProperty;

module.exports = (aran, weave, membrane) => {
  const meta_transitive_membrane = Transitive(membrane);
  const base_transitive_membrane = Transitive({enter:meta_transitive_membrane.leave, leave:meta_transitive_membrane.enter});
  const traps = {};
  ///////////////
  // Producers //
  ///////////////
  // TRANSPARENT: read
  traps.catch = (value, serial) => membrane.enter(value);
  traps.builtin = (identifier, value, serial) => membrane.enter(value);
  traps.primitive = (value, serial) => membrane.enter(value);
  traps.discard = (identifier, value, serial) => membrane.enter(value);
  traps.regexp = (value, serial) => membrane.enter(value);
  traps["function"] = (value, serial) => {
    Reflect_defineProperty(value1, "length", {
      value: membrane.enter(value1.length),
      writable: false,
      enumerable: false,
      configurable: true
    });
    Reflect_defineProperty(value1, "name", {
      value: membrane.enter(value1.name),
      writable: false,
      enumerable: false,
      configurable: true
    });
    return membrane.enter(value);
  };
  ///////////////
  // Consumers //
  ///////////////
  // TRANSPARENT: declare write return throw failure completion
  traps.success = ($value, serial) => aran.node(serial).AranParent ? $value : membrane.leave($value);
  traps.throw = ($value, serial) => membrane.leave($value);
  traps.test = ($value, serial) => membrane.leave($value);
  traps.eval = ($value, serial) => weave(String(membrane.leave($value)), aran.node(serial));
  traps.with = ($value, serial) => membrane.leave($value);
  ///////////////
  // Combiners //
  ///////////////
  traps.apply = (boolean, $value, $values, serial) => Reflect_apply(membrane.leave($value), boolean ? $sandbox : membrane.enter(void 0), $values);
  traps.invoke = ($value1, $value2, $values, serial) => Reflect_apply(membrane.leave($value1)[membrane.leave($value2)], $value1, $values);
  traps.construct = ($value, $values, serial) => Reflect_construct(membrane.leave($value1), $values);
  traps.get = ($value1, $value2, serial) => membrane.leave($value1)[membrane.leave($value2)];
  traps.set = ($value1, $value2, $value3, serial) => membrane.leave($value1)[membrane.leave($value2)] = $value3;
  traps.delete = ($value1, $value2) => membrane.enter(delete membrane.leave($value1)[membrane.leave($value2)]),
  traps.array = ($values, serial) => membrane.enter($values);
  traps.object = ($properties, serial) => membrane.enter(ArrayLite.reduce(
    $properties,
    (value, $property, index) => (
      value[membrane.leave($property[0]), index] = $property[1],
      value),
    {}));
  traps.unary = (operator, $value) => membrane.enter(eval(operator+" membrane.leave($value)"));
  traps.binary = (operator, $value1, serial) => membrane.enter(eval("membrane.leave($value1) "+operator+" membrane.leave($value2)"));
  ////////////////
  // Internface //
  ////////////////
  return {traps:traps, sandbox:membrane.leave(base_transitive_membrane.leave(global))};
};
