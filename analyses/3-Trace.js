var Linvail = require("../main.js");
var id = 0;
var calls = {
  push: function (x) { console.log("PUSH " + print(x)) },
  pop: function (x) { console.log("POP") }
}
function unwrap (ctx) {
  console.log("UNWRAP " + this.id + " " + ctx);
  return this.inner;
}
Linvail(calls, function (val, ctx) {
  console.log("WRAP " (++id) + " " + ctx);
  return {inner:val, id:id, unwrap:unwrap};
});

var print = {
  loc: function (loc) { return loc.line + ":" + loc.column },
  node: function (ast) { return ast ? ast.type+" "+print.loc(ast.loc.start) : "" },
  call: function (call) {
    if (call.length === 4)
      return (call[0].name || "anonymous") + " " + print.node(call[3]);
    if (call.length === 3)
      return (call[0].name || "anonymous") + " " + print.node(call[2]);
    if (call.length === 1)
      return print.node(call);
  }
}