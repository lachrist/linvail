
var Linvail = require("../main.js");
var calls = [];
var id = 0;
calls.push = function (info) {
  info.NaNs = [];
  calls[length] = info;
};
function wrap (val, ctx) {
  if (val !== val) {
    var wrapper = {id:++id, unwrap:unwrap, toString:toString}
    console.log(wrapper + "appeared");
    console.dir(calls[calls.length-1]);
    // msg  = "NaN #" + (++id) + " appeared";
    // if (call.node)
    //   msg += " at " + JSON.stringify(call.node.loc.start);
    // msg += " the function was " + call.function.name;
    // if (call.NaNs.length)
    //   msg += " and involved NaNs: " + call.NaNs;
    // console.log(msg);
    return wrapper;
  }
}
function toString () { return "NaN-" + this.id }
function unwrap (ctx) {
  console.log(this + " got used");
  calls[calls.length-1].NaNs.push(this);
  return NaN;
}
Linvail(calls, wrap);
