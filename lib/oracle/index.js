
const Object = require("./object.js");
const Aran = require("./aran.js");
const Array = require("./array.js");
const Reflect = require("./reflect.js");
const StandaloneWeakmap = require("../standalone-weakmap.js");

module.exports = (membrane, access, builtins) => {
  const oracle = StandaloneWeakmap();
  if (builtins)
    Aran(membrane, access, oracle, builtins);
  Reflect(membrane, access, oracle);
  Object(membrane, access, oracle);
  Array(membrane, access, oracle);
  return oracle;
};
