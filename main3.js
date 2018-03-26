
// object.__proto__ array.length function.prototype regexp.lastIndex
const MetaWerewolf = require("./meta-werewolf.js");
const BaseWerewolf = require("./base-werewolf.js");

const String = global.String;
const eval = global.eval;
const Reflect_apply = Reflect.apply;
const Reflect_construct = Reflect.construct;
const Reflect_defineProperty = Reflect.defineProperty;

module.exports = (aran, weave, membrane) => {
  const enter = (value) => membrane.enter(
    value && typeof value === "object" || typeof value === "function" ?
    mwerewolf.unturn(value) || bwerewolf.turn(value) || bwerewolf.bite(value) :
    value);
  const leave = (value) => (value = membrane.leave(value),
    value && typeof value === "object" || typeof value === "function" ?
    bwerewolf.unturn(value) || mwerewolf.turn(value) :
    value);
  const mwerewolf = MetaWerewolf(enter, leave);
  const bwerewolf = BaseWerewolf(enter, leave);
  const sandbox = bwerewolf.bite(global);
  global.global = global;
  const $sandbox = membrane.enter(sandbox);
  const traps = {};
  ///////////////
  // Producers //
  ///////////////
  // TRANSPARENT: read load
  traps.catch = (value, serial) => enter(value);
  traps.primitive = (value, serial) => membrane.enter(value);
  traps.discard = (identifier, value, serial) => membrane.enter(value);
  traps.regexp = (value, serial) => (mwerewolf.bite(value), membrane.enter(value));
  traps.arrival = (value, serial) => {
    mwerewolf.bite(value.arguments);
    mwerewolf.bite(value);
    if (value.new)
      mwerewolf.bite(value.this);
    value.callee = membrane.enter(value.callee);
    if (!aran.node(serial).AranStrict)
      value.arguments.callee = value.callee;
    value.this = value.new ? membrane.enter(value.this) : value.new;
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
    mwerewolf.bite(value);
    return membrane.enter(value);
  };
  ///////////////
  // Consumers //
  ///////////////
  // TRANSPARENT: declare write return failure completion save
  traps.throw = ($value, serial) => leave(value);
  traps.success = ($value, serial) => aran.node(serial).AranParent ? $value : leave($value);
  traps.test = ($value, serial) => membrane.leave($value);
  traps.eval = ($value, serial) => weave(String(leave($value)), aran.node(serial));
  traps.with = ($value, serial) => membrane.leave($value);
  ///////////////
  // Combiners //
  ///////////////
  traps.apply = (boolean, $value, $values, serial) => Reflect_apply(membrane.leave($value), boolean ? $sandbox : membrane.enter(void 0), $values);
  traps.invoke = ($value1, $value2, $values, serial) => {
    debugger;
    return Reflect_apply(membrane.leave(membrane.leave($value1)[leave($value2)]), $value1, $values);
  }
  traps.construct = ($value, $values, serial) => Reflect_construct(membrane.leave($value), $values);
  traps.get = ($value1, $value2, serial) => membrane.leave($value1)[leave($value2)];
  traps.set = ($value1, $value2, $value3, serial) => membrane.leave($value1)[leave($value2)] = $value3;
  traps.delete = ($value1, $value2) => membrane.enter(delete membrane.leave($value1)[leave($value2)]),
  traps.array = ($values, serial) => (mwerewolf.bite($values), membrane.enter($values));
  traps.object = ($properties, serial) => {
    const value = {};
    mwerewolf.bite(value);
    for (let index=0, length = properties.length; index < length; index++)
      value[leave($properties[index][0])] = $properties[index][1];
    return membrane.enter(value);
  };
  traps.unary = (operator, $value) => membrane.enter(eval(operator+" leave($value)"));
  traps.binary = (operator, $value1, serial) => membrane.enter(eval("leave($value1) "+operator+" leave($value2)"));
  ///////////////
  // Interface //
  ///////////////
  return {traps:traps, sandbox:sandbox};
};
