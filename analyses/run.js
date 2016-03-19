
var Aran = require("aran");
Aran({
  main: __dirname + "/target.js",
  analysis: __dirname + "/NaN.js",
  "out": __dirname + "/NaNBundle.js",
  namespace: "aran",
  traps: ["Ast", "literal", "unary", "binary", "apply", "construct", "eval", "get", "set", "delete", "enumerate", "test"]
});
