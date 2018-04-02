const Aran = require("aran");
const Acorn = require("acorn");
const Astring = require("astring");
const Linvail = require("linvail");
const LinvailJSON = require("linvail/src/json");

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
global.META = linvail.traps;
META.GLOBAL = linvail.sandbox;
linvail.base.restore(META.GLOBAL).JSON = LinvailJSON(linvail);
global.eval(Astring.generate(aran.setup(pointcut)));
module.exports = (script) => global.eval(instrument(script, null));