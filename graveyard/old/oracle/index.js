
const Object = require("./object.js");
const Array = require("./array.js");
const Reflect = require("./reflect.js");

module.exports = (membrane, access, oracle, sandbox) => {
  Reflect(membrane, access, oracle, sandbox);
  Object(membrane, access, oracle, sandbox);
  Array(membrane, access, oracle, sandbox);
};
