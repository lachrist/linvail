
const Linvail = require("../lib/main.js");
const StandaloneWeakmap = require("./standalone-weakmap.js");

const TypeError = global.TypeError;
const JSON_stringify = JSON.stringify;
const Reflect_apply = Reflect.apply;
const String_prototype_indexOf = String.prototype.indexOf;
const String_prototype_substring = String.prototype.substring;
const Object_prototype_toString = Object.prototype.toString;

const print = (value) => {
  if (typeof value === "string")
    return JSON_stringify(value);
  if (value !== null && (typeof value === "object" || typeof value === "function"))
    return Reflect_apply(Object_prototype_toString, value, []);
  return String(value);
};  

const stack = () => {
  const string1 = (new TypeError()).stack;
  const index1 = Reflect_apply(String_prototype_indexOf, string1, ["\n"]);
  const string2 = Reflect_apply(String_prototype_substring, string1, [index1+1]);
  const index2 = Reflect_apply(String_prototype_indexOf, string2, ["\n"]);
  return Reflect_apply(String_prototype_substring, string2, [index2]);
};

module.exports = (membrane, access) => {
  const tames = StandaloneWeakmap();
  const wilds = StandaloneWeakmap();
  const dirties = StandaloneWeakmap();
  const {capture, release} = access;
  membrane._taint = membrane.taint;
  membrane._clean = membrane.clean;
  const check_wild = (wild) => {
    if (wild !== null && (typeof wild === "object" || typeof wild === "function")) {
      if (dirties.has(wild))
        throw new TypeError(print(wild)+" marked as dirty:"+dirties.get(wild)+"\nUsed as wild:");
      if (tames.has(wild))
        throw new TypeError(print(wild)+" marked as tame:"+tames.get(wild)+"\nUsed as wild:");
      if (!wilds.has(wild)) {
        wilds.set(wild, stack());
      }
    }
  };
  const check_tame = (tame) => {
    if (tame !== null && (typeof tame === "object" || typeof tame === "function")) {
      if (dirties.has(tame))
        throw new TypeError(print(tame)+" marked as dirty:"+dirties.get(tame)+"\nUsed as tame:");
      if (wilds.has(tame))
        throw new TypeError(print(tame)+" marked as wild:"+wilds.get(tame)+"\nUsed as tame:");
      if (!tames.has(tame)) {
        tames.set(tame, stack());
      }
    }
  };
  const check_dirty = (dirty) => {
    if (dirty !== null && (typeof dirty === "object" || typeof dirty === "function")) {
      if (wilds.has(dirty))
        throw new TypeError(print(dirty)+" marked as wild:"+wilds.get(dirty)+"\nUsed as dirty:");
      if (tames.has(dirty))
        throw new TypeError(print(dirty)+" marked as tame:"+tames.get(dirty)+"\nUsed as dirty:");
      if (!dirties.has(dirty)) {
        throw new TypeError("Wrapper unmarked: "+print(dirty));
      }
    }
  };
  access.capture = (wild) => {
    check_wild(wild);
    const tame = capture(wild);
    check_tame(tame);
    return tame;
  };
  access.release = (tame) => {
    check_tame(tame);
    const wild = release(tame);
    check_wild(wild);
    return wild;
  };
  membrane.taint = (tame) => {
    check_tame(tame);
    const dirty = membrane._taint(tame);
    if (dirty !== null && (typeof dirty === "object" || typeof dirty === "function"))
      dirties.set(dirty, stack());
    check_dirty(dirty);
    return dirty;
  };
  membrane.clean = (dirty) => {
    check_dirty(dirty);
    const tame = membrane._clean(dirty);
    check_tame(tame);
    return tame;
  };
};
