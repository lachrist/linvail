
var stringify = JSON.stringify;
var parse = JSON.parse;

module.exports = function (linvail, membrane, cache) {
  var prefix = "linvail-"+Math.random().toString(36).substring(2)+"-";
  cache = cache || Object.create(null);
  function parseloop (json) {
    if (isArray(json)) {
      for (var index=0; index<json.length; index++)
        json[index] = parse(json[index]);
      return linvail.traps.array(json, null);
    }
    if (typeof json === "object" && json !== null) {
      for (var key in json)
        json[key] = parseloop(json[key]);
      return linvail.traps.object(json, null);
    }
    if (typeof json === "string" && json.indexOf(prefix) === 0) {
      return cache[json.substring(prefix.length)];
    }
    return linvail.membrane.enter(json, null);
  }
  function stringifyloop (value) {
    var raw = linvail.membrane.leave(value, null);
    if (Array.isArray(raw)) {
      var copy = [];
      for (var index=0; index<raw.length; index++)
        copy[index] = stringifyloop(linvail.traps.get(value, index, null));
      return copy;
    }
    if (typeof raw === "object" && raw !== null) {
      var copy = {};
      for (var key in raw)
        copy[key] = stringifyloop(linvail.traps.get(raw, key, null));
      return copy;
    }
    if (raw !== value && (raw === null || raw === true || raw === false || typeof raw === "string" || typeof raw === "number")) {
      do {
        var token = Math.random().toString(36).substring(2);
      } while (token in cache)
      cache[token] = value;
      return prefix+token;
    }
    return raw;
  }
  return {
    parse: linvail.traps.function(function (value) { return parseloop(parse(value)) }, null),
    stringify: linvail.traps.function(function (value) { return stringify(stringifyloop(value)) }, null)
  };
};
