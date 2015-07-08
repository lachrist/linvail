// var input1 = document.createElement("input");
// input1.type = "text";
// document.body.appendChild(input1);
// var input2 = document.createElement("input");
// input2.type = "text";
// document.body.appendChild(input2);
// function identity (x) { return x }
// input1.onchange = update;
// input2.onchange = update;
// function update () {
//   var x = input1.value;
//   var y = input2.value;
//   var z = x+y;
//   if (identity(z))
//     console.log("path1");
//   else
//     console.log("path2");
// }

var Linvail = require("..");

var inputGetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").get;

var store, path
(function () {
  var storeIdx = 0;
  var pathIdx = 0;
  function symbolToString () { r}
  store = {
    push: function (right) {
      console.log("STORE: sym"+storeIdx+" = "+right);
      return "sym"+storeIdx++;
    }
  }
  path = { push: function (test) { console.log("PATH: "+test) } }
} ());

function unwrap (ctx) {
  var call = lastCall();
  if (/^(If|Conditional|For|ForIn|While|DoWhile)/.test(ctx.type))
    path.push(this.symbol)
  if (call && call.function === Reflect.binary)
    call[(ctx==="arguments[1]")?"left":"right"] = this.symbol;
  this.inner;
}

var intercept = {
  primitive: function (val, ctx) {
    var call = lastCall();
    if (call && call.function === inputGetter)
      return {symbol:store.push(null), inner:val, unwrap:unwrap};
    if (call && (call.left || call.right)) {
      var left = call.left || Number(call[1]);
      var right = call.right || Number(call[2]);
      var symbol = store.push(left+" "+call[0]+" "+right);
      return {symbol:symbol, inner:val, unwrap:unwrap}
    }
    return val;
  },
  object: function (obj, ctx) { return obj }
};

function lastCall () { return calls[calls.length-1] }
var calls = [];
var callstack = {
  push: function (call) { calls.push(call) },
  pop: function (res) { calls.pop() }
};

module.exports = Linvail(intercept, callstack);
