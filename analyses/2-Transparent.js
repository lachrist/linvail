
var Linvail = require("../main.js");
var calls = [];
function unwrap (ctx) { return this.inner }
Linvail(calls, function (val, ctx) { return {inner:val, unwrap:unwrap} });
