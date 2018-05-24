const Fs = require("fs");



Fs.writeFileSync(__dirname+"/src/meta-proxy.js", Fs.readFileSync(__dirname+"/src/base-proxy.js", "utf8").replace(/(baseof\(membrane\.leave\(|membrane\.enter\(metaof\(|metaof|baseof)/g, (match) => {
  switch (match) {
    case "baseof(membrane.leave(": return "membrane.enter(metaof(";
    case "membrane.enter(metaof(": return "baseof(membrane.leave(";
    case "baseof": return "metaof";
    case "metaof": return "baseof";
  }
  throw new Error("Illegal match: "+match);
}), "utf8");
// .replace("return target.__linvail__.length;", "return membrane.enter(target.__linvail__.length);").replace("target.__linvail__.length = value", "target.__linvail__.length = baseof(membrane.leave(value))")