
var fs = require("fs");
var browserify = require("browserify");

fs.readdirSync(__dirname).forEach(function (file) {
  if (/.js$/.test(file) && file !== "bundle.js") {
    var b = browserify();
    b.require(__dirname+"/"+file, {expose: "master"});
    b.external("aran");
    b.bundle().pipe(fs.createWriteStream(__dirname+"/bundle/"+file));
  }
});
