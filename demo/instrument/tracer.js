const Acorn = require("acorn");
const Aran = require("aran");
const Astring = require("astring");
const Linvail = require("linvail");
const counter = 0;
const aran = Aran({namespace:"ADVICE", sandbox:true});
const linvail = Linvail({
  instrument: (script, serial) =>
    Astring.generate(aran.weave(Acorn.parse(script, {locations:true}), pointcut, serial)),
  enter: (value) => {
    console.log("ENTER", value);
    return value;
  },
  leave: (value) => {
    console.log("LEAVE", value);
    return value;
  }
});
const pointcut = Object.keys(linvail.advice);
global.ADVICE = {};
pointcut.forEach((key) => {
  ADVICE[key] = (...arguments) => {
    const identity = counter++;
    console.log("BEGIN", "#"+identity, key, ...arguments);
    const result = Reflect.apply(linvail.advice[key](...arguments));
    console.log("END  ", "#"+identity, key, result);
    return result;
  };
});
global.eval(Astring.generate(aran.setup()));
module.exports = linvail.membrane.instrument;
