
const Array_isArray = Array.isArray;
const Math_random = Math.random;
const Object_create = Object.create;
const JSON_stringify = JSON.stringify;
const JSON_parse = JSON.parse;
const NormalizeArray = require("./normalize-array");

module.exports = function (linvail, cache) {
  const prefix = "linvail-"+Math_random().toString(36).substring(2)+"-";
  const narray = NormalizeArray(linvail.enter, linvail.leave);
  cache = cache || Object_create(null);
  function ploop (value) {
    if (typeof value === "string" && value.startsWith(prefix))
      return cache[value.substring(prefix.length)];
    if (Array_isArray(value)) {
      for (let index = 0, length = value.length; index < length; index++)
        value[index] = ploop(value[index]);
      value = narray(value);
    } else if (value && typeof value === "object") { // __proto__ should be META!
      for (let key in value)
        value[key] = ploop(value[key]);
    }
    return linvail.membrane.enter(value);
  }
  function sloop ($value) {
    const value = linvail.membrane.leave($value);
    // TODO support boxed primitive and Date
    // if (value instanceof String || value instanceof Date) {
    //   value = String(base.restore(value) || meta.flip(value))
    //   $value = membrane.enter(value);
    // }
    // if (value instanceof Number) {
    //   value = Number(base.restore(value) || meta.flip(value));
    //   $value = membrane.enter(value);
    // }
    if (Array_isArray(value)) {
      const array = [];
      for (let index = 0, length = linvail.leave(value.length); index < length; index++)
        array[index] = sloop(value[index]);
      return array;
    }
    if (value && typeof value === "object") {
      const object = {};
      const keys = Reflect.ownKeys(value); // TODO WALK Hierarchy!, for-in raise  Uncaught TypeError: Invalid property descriptor. Cannot both specify accessors and a value or writable attribute, #<Object>
      for (let index = 0, length = keys.length; index < length; index++)
        object[keys[index]] = sloop(value[keys[index]]);
      return object;
    }
    if (value !== value || value === 1/0 || value === -1/0)
      $value = linvail.membrane.enter(null);
    if (!value || value === true || typeof value === "string" || typeof value === "number") {
      do {
        var token = Math_random().toString(36).substring(2);
      } while (token in cache)
      cache[token] = $value;
      return prefix+token;
    }
    return value; // symbol + function
  }
  // TODO improve JSON support (formatter, reviver, etc...)
  return {
    parse: linvail.meta.flip((value) => ploop(JSON_parse(linvail.leave(value)))),
    stringify: linvail.meta.flip((value) => linvail.membrane.enter(JSON_stringify(sloop(value))))
  };
};
