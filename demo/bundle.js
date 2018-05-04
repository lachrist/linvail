
const Fs = require("fs");
const SandboxScenario = require("sandbox-scenario");

const callback = (name) => (error, script) => {
  if (error)
    throw error;
  Fs.writeFileSync(__dirname+"/output/"+name+".html", [
    "<!DOCTYPE html>",
    "<html>",
    "  <head>",
    "    <title>sandbox-scenario demo</title>",
    "  </head>",
    "  <body>",
    "    <script type=\"text/javascript\">",
    script.replace(/<\/script>/g, "<\\/script>"),
    "    </script>",
    "  </body>",
    "</html>"
  ].join("\n"), "utf8");
}

const bundle = (instrument, target) => SandboxScenario(
  {type:"raw", path:__dirname+"/spawn.js"},
  [
    {type:"browserify", path:__dirname+"/instrument/"+instrument+".js"}],
  [
    {type:"raw", path:__dirname+"/target/"+target+".js"}],
  callback(instrument+"-"+target));

bundle("identity", "delta");
bundle("identity-explicit", "delta");
bundle("wrapper", "delta");
bundle("concolic", "delta");
// bundle("json", "json");
