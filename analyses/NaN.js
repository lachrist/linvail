var Linvail = require("../main.js");
var id = 0, calls = [];
calls.push = function (info) {
  info.NaNs = [];
  calls[length] = info;
};
function wrap (val) {
  if (val !== val) {
    console.log("NaN #" + (++id));
    console.dir(calls[calls.length - 1]);
    return {id:id, unwrap:unwrap};
  }
}
function unwrap () {
  calls[calls.length-1].NaNs.push(this.id);
  return NaN;
}
Linvail(calls, wrap);