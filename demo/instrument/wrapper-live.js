const AranLive = require("aran/live");
const Linvail = require("linvail");

let counter = 0;
let wrappers = new WeakMap();

const membrane = {
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
};
const linvail = Linvail(membrane);
const aranlive = AranLive(linvail.advice, {sandbox:true});
membrane.instrument = aranlive.instrument;
module.exports = aranlive.instrument;
