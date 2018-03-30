const Aran = require("aran");
const Acorn = require("acorn");
const Astring = require("astring");
const Linvail = require("linvail");

let counter1 = 0;
let counter2 = 0;
let pointers = new WeakMap();

const print = (value) => {
  if (value && typeof value === "object" || typeof value === "function") {
    let pointer = pointers.get(value);
    if (!pointer) {
      pointer = ++counter1;
      pointers.set(value, pointer);
    }
    return "&" + pointer;
  }
  if (typeof value === "string")
    return JSON.stringify(value);
  return String(value);
};

const aran = Aran({namespace:"META", sandbox:true});
const instrument = (script, parent) =>
  Astring.generate(aran.weave(Acorn.parse(script), pointcut, parent));
const linvail = Linvail(instrument, {
  enter: (value) => ({base:value, meta:"@"+(++counter2)}),
  leave: (wrapper) => wrapper.base
});
const pointcut = Object.keys(linvail.traps);
const META = {};

///////////////
// Producers //
///////////////


["catch", "primitive", "discard", "regexp", "arrival", "function"].forEach((name) => {
  META[name] = function () {
    const result = linvail.traps[name].apply(null, arguments);
    arguments[arguments.length-2] = print(arguments[arguments.length-2]);
    arguments.join = Array.prototype.join;
    console.log(result.meta+" = "+name+"("+arguments.join(", ")+")");
    return result;
  };
});

///////////////
// Consumers //
///////////////
["throw", "test", "eval", "with", "success"].forEach((name) => {
  META[name] = function () {
    const result = linvail.traps[name].apply(null, arguments);
    arguments[arguments.length-2] = arguments[arguments.length-2].meta;
    arguments.join = Array.prototype.join;
    console.log(name+"("+arguments.join(", ")+")");
    return result;
  };
});

///////////////
// Combiners //
///////////////
const metaof = (value) => value.meta;
const property = (pair) => "["+pair[0].meta+","+pair[1].meta+"]";
const combine = (result, name, origin, serial) => {
  console.log(result.meta+"("+print(result.base)+") = "+name+"("+origin+", "+serial+")");
  return result;
};
META.apply = (value1, value2, values, serial) => combine(
  linvail.traps.apply(value1, value2, values, serial),
  "apply", value1.meta+", "+value2.meta+", ["+values.map(metaof)+"]", serial);
META.invoke = (value1, value2, values, serial) => combine(
  linvail.traps.invoke(value1, value2, values, serial),
  "invoke", value1.meta+", "+value2.meta+", ["+values.map(metaof)+"]", serial);
META.construct = (value, values, serial) => combine(
  linvail.traps.construct(value, values, serial),
  "construct", value.meta+", ["+values.map(metaof)+"]", serial);
META.get = (value1, value2, serial) => combine(
  linvail.traps.get(value1, value2, serial),
  "get", value1.meta+", "+value2.meta, serial);
META.set = (value1, value2, value3, serial) => combine(
  linvail.traps.set(value1, value2, value3, serial),
  "set", value1.meta+", "+value2.meta+", "+value3.meta, serial);
META.delete = (value1, value2, serial) => combine(
  linvail.traps.delete(value1, value2, serial),
  "delete", value1.meta+", "+value2.meta, serial);
META.array = (values, serial) => combine(
  linvail.traps.array(values, serial),
  "array", "["+values.map(metaof)+"]", serial);
META.object = (properties, serial) => combine(
  linvail.traps.object(properties, serial),
  "object", "["+properties.map(property)+"]", serial);
META.unary = (operator, value, serial) => combine(
  linvail.traps.unary(operator, value, serial),
  "unary", "\""+operator+"\", "+value.meta, serial);
META.binary = (operator, value1, value2, serial) => combine(
  linvail.traps.binary(operator, value1, value2, serial),
  "binary", "\""+operator+"\", "+value1.meta+", "+value2.meta, serial);

let sandbox = linvail.sandbox;
eval(Astring.generate(aran.setup(pointcut)));
module.exports = (script) => eval(instrument(script, null));
