
var Linvail = require("../main.js");
var calls = [];
var id = 0;
calls.push = function (info) {
  info.NaNs = [];
  calls[length] = info;
};
function wrap (val, ctx) {
  if (val !== val) {
    var wrapper = {id:++id, unwrap:unwrap, toString:toString};
    var call = calls[calls.length - 1];
    var log  = wrapper + " appeared";
    if (call.node)
      log += " at " + JSON.stringify(call.node.loc.start);
    log += " while applying " + call.function.name;
    if (call.NaNs.length)
      log += " and involved NaNs: " + call.NaNs;
    console.log(log);
    return wrapper;
  }
}
function toString () { return "NaN-" + this.id }
function unwrap (ctx) {
  calls[calls.length-1].NaNs.push(this);
  return NaN;
}
Linvail(calls, wrap);
