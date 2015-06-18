var fs = require("fs");
var browserify = require("browserify");

var name = process.argv[2];
var html = [
  "<html>",
  "<meta charset=\"UTF-8\">",
  "<title>"+name+"</title>",
  "<body>",
  "<textarea rows=\"20\" cols=\"50\" id=\"target\"></textarea>",
  "<textarea rows=\"20\" cols=\"100\" id=\"compiled\"></textarea>",
  "<br/>",
  "<button id=\"run\">Run</button>",
  "<br/>",
  "<textarea rows=\"50\" cols=\"150\" id=\"logger\"></textarea>",
  "</body>",
  "<script src=\""+name+".js\"></script>",
  "<script>",
  "(function () {",
  "  var logger = document.getElementById('logger');",
  "  window.out = function (msg) { logger.value = logger.value+msg }",
  "  document.getElementById('run').onclick = function () {",
  "    var input = {code:document.getElementById('target').value};",
  "    require('"+name+"')(input);",
  "    document.getElementById('compiled').value = input.compiled;",
  "  };",
  "} ());",
  "</script>",
  "</html>"
].join("\n");

fs.writeFile(__dirname+"/html/"+name+".html", html, {encoding:"utf8"});
browserify()
  .require(__dirname+"/"+name+".js", {expose:name})
  .bundle()
  .pipe(fs.createWriteStream(__dirname+"/html/"+name+".js"));
