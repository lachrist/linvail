const Acorn = require("acorn");
const Aran = require("aran");
const Astring = require("astring");
const Linvail = require("linvail");

let counter = 0;
let wrappers = new WeakMap();

const aran = Aran({namespace:"ADVICE", sandbox:true});
const linvail = Linvail({
  instrument: (script, serial) =>
    Astring.generate(aran.weave(Acorn.parse(script, {locations:true}), pointcut, serial)),
  enter: (value) => {
    if (value && typeof value === "object" || typeof value === "function") {
      var wrapper = wrappers.get(value);
      if (!wrapper) {
        wrapper = {concrete:value, shadow:++counter};
        console.log("#"+counter+" << ["+(typeof value)+"]");
        wrappers.set(value, wrapper);
      }
    } else {
      var wrapper = {concrete:value, shadow:++counter};
      let print = typeof value === "string" ? JSON.stringify : String;
      console.log("#"+counter+" << "+print(value));
    }
    return wrapper;
  },
  leave: (value) => (console.log(">> #"+value.shadow), value.concrete)
});
global.ADVICE = linvail.advice;
const pointcut = Object.keys(ADVICE);
global.eval(Astring.generate(aran.setup()));
module.exports = linvail.membrane.instrument;
