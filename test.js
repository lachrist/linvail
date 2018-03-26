
const Linvail = require("./main3.js");
const ArrayLite = require("array-lite");
const Aran = require("aran");
const Acorn = require("acorn");
const Astring = require("astring");
const Util = require("util");

const print = (value) => {
  if (typeof value === "function")
    return "function";
  if (typeof value === "object")
    return value ? "object" : "null";
  if (typeof value === "string")
    return JSON.stringify(value);
  return String(value);
};

let counter = 0;
const aran = Aran({namespace:"META", sandbox:true});
const weave = (script, parent) => Astring.generate(aran.weave(Acorn.parse(script), pointcut, parent));
const linvail = Linvail(aran, weave, {
  enter: (value) => (console.log("enter #"+(++counter)+" = "+print(value))/*Util.inspect(value, {showProxy:true,depth:1}))*/, {base:value, meta:counter}),
  leave: ($value) => (console.log("leave #"+$value.meta), $value.base)
});
const META = {};
const pointcut = Reflect.ownKeys(linvail.traps);
ArrayLite.forEach(pointcut, (name) => {
  META[name] = function () {
    console.log(name+"("+ArrayLite.join(ArrayLite.map(arguments, print), ", ")+")");
    // console.log(name+" >> "+Util.inspect(arguments, {showProxy:true,depth:2}));
    const result = Reflect.apply(linvail.traps[name], null, arguments);
    console.log(name+" << "+print(result));
    // console.log(name+" << "+Util.inspect(result, {showProxy:true,depth:1}));
    return result;
  };
});
{
  let sandbox = linvail.sandbox;
  const setup = Astring.generate(aran.setup(pointcut));
  eval(setup);
}
let script = [
"Math.sqrt(4);"
];
script = weave(script, null);
eval(script);