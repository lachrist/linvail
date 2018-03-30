const Aran = require("aran");
const Acorn = require("acorn");
const Astring = require("astring");
const Linvail = require("linvail");

const aran = Aran({namespace:"META", sandbox:true});
const instrument = (script, parent) =>
  Astring.generate(aran.weave(Acorn.parse(script), pointcut, parent));
const linvail = Linvail(instrument, {
  enter: (value) => value,
  leave: (value) => value
});
const pointcut = Object.keys(linvail.traps);
const META = linvail.traps;
let sandbox = linvail.sandbox;
eval(Astring.generate(aran.setup(pointcut)));
module.exports = (script) => eval(instrument(script, null));
