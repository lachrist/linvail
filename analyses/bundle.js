
var Browserify = require("browserify");
var Fs = require("fs");

var excluded = [".DS_Store", "bundle.js", "bundles"];

Fs.readdirSync(__dirname).forEach(function (name) {
  if (excluded.indexOf(name) === -1)
    Browserify()
      .add(__dirname + "/" + name)
      .bundle()
      .pipe(Fs.createWriteStream(__dirname + "/bundles/" + name));
}); 
