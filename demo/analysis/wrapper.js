const Aran = require("aran");
const Acorn = require("acorn");
const Astring = require("astring");
const Linvail = require("linvail");

const print = (value) => {
  if (value && typeof value === "object")
    return "#object";
  if (typeof value === "function")
    return "#function";
  if (typeof value === "string")
    return JSON.stringify(value);
  return String(value);
}

const aran = Aran({namespace:"META", sandbox:true});
const instrument = (script, parent) =>
  Astring.generate(aran.weave(Acorn.parse(script), pointcut, parent));
let counter = 0;
const linvail = Linvail(instrument, {
  enter: (value) => (console.log("@"+(++counter)+" = "+print(value)), {base:value,meta:counter}),
  leave: (value) => (console.log("using @"+value.meta), value.base)
});
const pointcut = Object.keys(linvail.traps);
const META = linvail.traps;
let sandbox = linvail.sandbox;
eval(Astring.generate(aran.setup(pointcut)));
module.exports = (script) => eval(instrument(script, null));
