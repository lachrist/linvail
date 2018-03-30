const Test = require("./test.js");
const Fs = require("fs");
const Path = require("path");
const Analysis = require(Path.resolve(process.argv[2]));
if (process.argv[3].endsWith(".js")) {
  Analysis(Fs.readFileSync(process.argv[3]));
} else {
  Fs.readdirSync(process.argv[3]).forEach((filename) => {
    if (filename !== ".DS_Store") {
      try {
        process.stderr.write(filename+"...\n");
        Analysis(Fs.readFileSync(Path.resolve(process.argv[3])+"/"+filename));
      } catch (error) {
        process.stderr.write(String(error)+"\n");
      }
    }
  });
}
