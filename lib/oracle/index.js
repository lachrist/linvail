
const Object = require("./object.js");
const Array = require("./array.js");
const Reflect = require("./reflect.js");
const StandaloneWeakmap = require("../standalone-weakmap.js");

module.exports = (membrane, access) => {
  const oracle = StandaloneWeakmap();
  Reflect(membrane, access, oracle);
  Object(membrane, access, oracle);
  Array(membrane, access, oracle);
  return oracle;
};
