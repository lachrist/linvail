
var fs = require("fs")
var browserify = require("browserify")

// var bnode = browserify()
// bnode.add("./node.js")
// bnode.bundle().pipe(fs.createWriteStream("./node-bundle.js"))

var bdemo = browserify()
bdemo.add("./demo.js")
bdemo.bundle().pipe(fs.createWriteStream("./demo-bundle.js"))

// var bbrowser = browserify()
// bbrowser.add("./browser.js")
// bbrowser.bundle().pipe(fs.createWriteStream("./browser-bundle.js"))
