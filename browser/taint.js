// var input = document.createElement("input");
// var output = document.createElement("p");
// input.type = "password";
// document.body.appendChild(input);
// document.body.appendChild(output);
// input.onchange = function () {
//   output.textContent = input.value;
// }



var Linvail = require("..");

// Callstack //
var calls = [];
var taintedObjects = new WeakSet();
function lastCall () { return calls[calls.length-1] }
var callstack = {
  push: function (call) {
    debugger;
    var src1 = call.function === Reflect.get
            && call[0] instanceof HTMLInputElement
            && call[0].type === "password"
    var src2 = call.function === Reflect.enumerate
            && taintedObjects.has(call[0]);
    call.tainted = src1 || src2;
    call.leak = call.function === Reflect.set
             && call[0] instanceof HTMLElement
    calls.push(call);
  },
  pop: function (res) { calls.pop() }
};

// Intercept //
function unwrap (ctx) {
  if (/^(Conditional|If|While|Do|For)/.test(ast.type))
    return Boolean(this.inner);
  if (lastCall().leak) {
    var msg = "Tainted value from "+this.context;
    msg += " leaks in the DOM at "+lastCall().context;
    throw new Error(msg);
  }
  if (ctx === 1 && lastCall().function === Reflect.set)
    taintedObjects.add(lastCall()[0])
  lastCall().tainted = true;
  return this.inner;
}
var intercept = {
  primitive: function (val, ctx) {
    if (lastCall() && lastCall().tainted)
      return {inner:val, unwrap:unwrap, context:ctx};
    return val;
  },
  object: function (val, ctx) { return val }
};

module.exports = Linvail(intercept, callstack);