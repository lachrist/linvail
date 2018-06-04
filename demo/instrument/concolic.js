const Acorn = require("acorn");
const Aran = require("aran-access-control");
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

const membrane = {
  enter: (value) => ({concrete:value, shadow:"#"+(++counter2)}),
  leave: (wrapper) => wrapper.concrete,
  instrument: (script, serial) => Astring.generate(aran.weave(Acorn.parse(script, {locations:true}), pointcut, serial))
};

const aac = AranAccessControl(membrane);

const pointcut = Object.keys(linvail.advice);

const location = (serial) => aran.node(serial).loc.start.line;

global.ADVICE = {SANDBOX:linvail.advice.SANDBOX};

///////////////
// Producers //
///////////////
ADVICE.arrival = linvail.advice.arrival;
["begin", "catch", "primitive", "discard", "regexp", "closure"].forEach((name) => {
  ADVICE[name] = function () {
    const result = linvail.advice[name].apply(null, arguments);
    arguments[arguments.length-2] = print(arguments[arguments.length-2]);
    arguments.length--;
    arguments.join = Array.prototype.join;
    console.log(result.shadow+" = "+name+"("+arguments.join(", ")+") "+location(arguments[arguments.length]));
    return result;
  };
});

///////////////
// Consumers //
///////////////
["return", "throw", "success", "test", "eval", "with"].forEach((name) => {
  ADVICE[name] = function () {
    const result = linvail.advice[name].apply(null, arguments);
    arguments[arguments.length-2] = arguments[arguments.length-2].shadow;
    arguments.length--;
    arguments.join = Array.prototype.join;
    console.log(name+"("+arguments.join(", ")+") "+location(arguments[arguments.length]));
    return result;
  };
});

///////////////
// Combiners //
///////////////
const shadowof = (value) => value.shadow;
const property = (pair) => "["+pair[0].shadow+","+pair[1].shadow+"]";
const combine = (result, name, origin, serial) => {
  console.log(result.shadow+" = "+name+"("+origin+") "+location(serial)+" // "+print(result.concrete));
  return result;
};
ADVICE.apply = (value, values, serial) => combine(
  linvail.advice.apply(value, values, serial),
  "apply", value.shadow+", ["+values.map(shadowof)+"]", serial);
ADVICE.invoke = (value1, value2, values, serial) => combine(
  linvail.advice.invoke(value1, value2, values, serial),
  "invoke", value1.shadow+", "+value2.shadow+", ["+values.map(shadowof)+"]", serial);
ADVICE.construct = (value, values, serial) => combine(
  linvail.advice.construct(value, values, serial),
  "construct", value.shadow+", ["+values.map(shadowof)+"]", serial);
ADVICE.get = (value1, value2, serial) => combine(
  linvail.advice.get(value1, value2, serial),
  "get", value1.shadow+", "+value2.shadow, serial);
ADVICE.set = (value1, value2, value3, serial) => combine(
  linvail.advice.set(value1, value2, value3, serial),
  "set", value1.shadow+", "+value2.shadow+", "+value3.advice, serial);
ADVICE.delete = (value1, value2, serial) => combine(
  linvail.advice.delete(value1, value2, serial),
  "delete", value1.shadow+", "+value2.shadow, serial);
ADVICE.array = (values, serial) => combine(
  linvail.advice.array(values, serial),
  "array", "["+values.map(shadowof)+"]", serial);
ADVICE.object = (properties, serial) => combine(
  linvail.advice.object(properties, serial),
  "object", "["+properties.map(property)+"]", serial);
ADVICE.unary = (operator, value, serial) => combine(
  linvail.advice.unary(operator, value, serial),
  "unary", "\""+operator+"\", "+value.shadow, serial);
ADVICE.binary = (operator, value1, value2, serial) => combine(
  linvail.advice.binary(operator, value1, value2, serial),
  "binary", "\""+operator+"\", "+value1.shadow+", "+value2.shadow, serial);

const aran = Aran({namespace:"ADVICE", sandbox:true});
global.eval(Astring.generate(aran.setup()));
module.exports = membrane.instrument;