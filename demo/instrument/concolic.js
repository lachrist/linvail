const AranLive = require("aran/live");
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
  enter: (value) => ({base:value, meta:"#"+(++counter2)}),
  leave: (wrapper) => wrapper.base
};

const linvail = Linvail(membrane);

const location = (serial) => aranlive.node(serial).loc.start.line;

const advice = {SANDBOX:linvail.advice.SANDBOX};

///////////////
// Producers //
///////////////
advice.arrival = linvail.advice.arrival;
["begin", "catch", "primitive", "discard", "regexp", "closure"].forEach((name) => {
  advice[name] = function () {
    const result = linvail.advice[name].apply(null, arguments);
    arguments[arguments.length-2] = print(arguments[arguments.length-2]);
    arguments.length--;
    arguments.join = Array.prototype.join;
    console.log(result.meta+" = "+name+"("+arguments.join(", ")+") "+location(arguments[arguments.length]));
    return result;
  };
});

///////////////
// Consumers //
///////////////
["return", "throw", "success", "test", "eval", "with"].forEach((name) => {
  advice[name] = function () {
    const result = linvail.advice[name].apply(null, arguments);
    arguments[arguments.length-2] = arguments[arguments.length-2].meta;
    arguments.length--;
    arguments.join = Array.prototype.join;
    console.log(name+"("+arguments.join(", ")+") "+location(arguments[arguments.length]));
    return result;
  };
});

///////////////
// Combiners //
///////////////
const metaof = (value) => value.meta;
const property = (pair) => "["+pair[0].meta+","+pair[1].meta+"]";
const combine = (result, name, origin, serial) => {
  console.log(result.meta+" = "+name+"("+origin+") "+location(serial)+" // "+print(result.base));
  return result;
};
advice.apply = (value, values, serial) => combine(
  linvail.advice.apply(value, values, serial),
  "apply", value.meta+", ["+values.map(metaof)+"]", serial);
advice.invoke = (value1, value2, values, serial) => combine(
  linvail.advice.invoke(value1, value2, values, serial),
  "invoke", value1.meta+", "+value2.meta+", ["+values.map(metaof)+"]", serial);
advice.construct = (value, values, serial) => combine(
  linvail.advice.construct(value, values, serial),
  "construct", value.meta+", ["+values.map(metaof)+"]", serial);
advice.get = (value1, value2, serial) => combine(
  linvail.advice.get(value1, value2, serial),
  "get", value1.meta+", "+value2.meta, serial);
advice.set = (value1, value2, value3, serial) => combine(
  linvail.advice.set(value1, value2, value3, serial),
  "set", value1.meta+", "+value2.meta+", "+value3.advice, serial);
advice.delete = (value1, value2, serial) => combine(
  linvail.advice.delete(value1, value2, serial),
  "delete", value1.meta+", "+value2.meta, serial);
advice.array = (values, serial) => combine(
  linvail.advice.array(values, serial),
  "array", "["+values.map(metaof)+"]", serial);
advice.object = (properties, serial) => combine(
  linvail.advice.object(properties, serial),
  "object", "["+properties.map(property)+"]", serial);
advice.unary = (operator, value, serial) => combine(
  linvail.advice.unary(operator, value, serial),
  "unary", "\""+operator+"\", "+value.meta, serial);
advice.binary = (operator, value1, value2, serial) => combine(
  linvail.advice.binary(operator, value1, value2, serial),
  "binary", "\""+operator+"\", "+value1.meta+", "+value2.meta, serial);

const aranlive = AranLive(advice, {sandbox:true});
module.exports = membrane.instrument = (script, parent) => aranlive.instrument(script, parent, {locations:true});
