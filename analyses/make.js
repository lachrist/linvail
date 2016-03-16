
var Browserify = require("browserify");
var Fs = require("fs");

Browserify()
  .add(__dirname + "/NaN.js")
  .bundle()
  .pipe(Fs.createWriteStream(__dirname + "/_NaN_.js"));
