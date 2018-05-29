const Aran = require("aran");
const Acorn = require("acorn");
const Astring = require("astring");
const Linvail = require("linvail");

const aran = Aran({namespace:"META", sandbox:true});
const instrument = (script, parent) =>
  Astring.generate(aran.weave(Acorn.parse(script), pointcut, parent));
const linvail = Linvail({
  instrument: instrument,
  enter: (value) => value,
  leave: (value) => value
});
const pointcut = Object.keys(linvail.advice);
global.META = linvail.advice;
global.eval(Astring.generate(aran.setup()));
module.exports = instrument;