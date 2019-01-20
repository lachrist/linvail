
const Object = require("./object.js");
const Reflect = require("./reflect.js");
const Array = require("./array.js");

module.exports = (options) => {
  Reflect(options);
  Object(options);
  Array(options);
}
