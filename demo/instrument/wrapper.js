const AranLive = require("aran/live");
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
let counter = 0;
const membrane = {
  enter: (value) => (console.log("@"+(++counter)+" = "+print(value)), {base:value,meta:counter}),
  leave: (value) => (console.log("use @"+value.meta), value.base)
};
membrane.instrument = AranLive(Linvail(membrane).advice, {sandbox:true}).instrument;
module.exports = membrane.instrument;