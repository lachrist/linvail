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

const Fs = require("fs");
// // Fs.readdirSync("/Users/soft/Desktop/workspace/testrumenter/suite/atom").forEach((filename) => {
// //   console.log("WOWLWLWLWASDASDASDASSDDSA", filename);
// //   run(filename);
// // });

// function run (filename) {
//   global.eval(membrane.instrument(Fs.readFileSync("/Users/soft/Desktop/workspace/testrumenter/suite/atom/"+filename, "utf8")))
// }

//[ "Declaration.js", "PatternDefault.js"].forEach(run);

//global.eval(membrane.instrument("eval('undefined');undefined;"));
//global.eval(membrane.instrument("undefined;"));

// global.eval(membrane.instrument(`
// let f = function (x, ...xs) {
//   if (x !== "foo")
//     throw new Error("Rest1");
//   if (xs[0] !== "bar")
//     throw new Error("Rest2");
//   if (xs[1] !== "qux")
//     throw new Error("Rest3");
// };
// f("foo", "bar", "qux");`));

// global.eval(membrane.instrument(`
// let f = function () {
//   return;
//   throw new Error("Return1");
// }
// if (f() !== undefined)
//   throw new Error("Return2");`));
