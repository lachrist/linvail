#!/usr/bin/env node

var otiluke = require("otiluke");
if (process.argv.length !== 3)
  throw "Usage: linvail analysis.js < input.html > output.html";

var analysis = process.argv[2];
var name = analysis.split("/");
name = name[name.length-1];
name = name.split(".")[0];

otiluke(process.stdin, process.stdout, [__dirname+"/standalone.js", analysis], name, null, null);

// if (process.argv.length !== 5)
//   throw "Usage: linvail analysis.js input.js output.[js|html]";

// console.log(process.argv);

// var master = process.argv[2];
// var target = process.argv[3];
// var output = process.argv[4];
// var ws = fs.createWriteStream(output);

// if (/\.html$/.test(output))
//   ws.write([
//     "<html>",
//     "<meta charset=\"UTF-8\">",
//     "<body>",
//     "</body>",
//     "<script>"
//   ].join("\n"));

// browserify()
//   .require(master, {expose:"__analysis__"})
//   .bundle()
//   .pipe(ws);

// ws.write([
//   "\n(require('__analysis__'))(",
//   JSON.stringify(fs.readFileSync(target, {encoding:"utf8"})),
//   ");\n"
// ].join(""));

// if (/\.html$/.test(output))
//   ws.write([
//     "</script>",
//     "</html>"
//   ].join("\n"));

// ws.end();


// function () {

//   var js = [
//     fs.readFileSync(output, {encoding:"utf8"}),
//     "\n(require('analysis'))(",
//     JSON.stringify(fs.readFileSync(target, {encoding:"utf8"})),
//     ");"
//   ].join("");

//   if (/\.js$/.test(output))
//     fs.writeFileSync(output, js, {encoding:"utf8"});
//   else if (/\.html$/.test(output))
//     fs.writeFileSync(output, [
     

//     ].join("\n"), {encoding:"utf8"});
//   else
//     throw "Output must be a js or a html file...";

// })
