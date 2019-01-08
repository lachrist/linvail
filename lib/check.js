
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
  const wrappers = StandaloneWeakmap();
  const {capture, release} = access;
  const {enter, leave} = membrane;
  const check_wild = (wild) => {
    if (wild !== null && (typeof wild === "object" || typeof wild === "function")) {
      if (wrappers.has(wild))
        throw new TypeError(print(wild)+" marked as wrapper:"+wrappers.get(wild)+"\nUsed as wild:");
      if (tames.has(wild))
        throw new TypeError(print(wild)+" marked as tame:"+tames.get(wild)+"\nUsed as wild:");
      if (!wilds.has(wild)) {
        wilds.set(wild, stack());
      }
    }
  };
  const check_tame = (tame) => {
    if (tame !== null && (typeof tame === "object" || typeof tame === "function")) {
      if (wrappers.has(tame))
        throw new TypeError(print(tame)+" marked as wrapper:"+wrappers.get(tame)+"\nUsed as tame:");
      if (wilds.has(tame))
        throw new TypeError(print(tame)+" marked as wild:"+wilds.get(tame)+"\nUsed as tame:");
      if (!tames.has(tame)) {
        tames.set(tame, stack());
      }
    }
  };
  const check_wrapper = (wrapper) => {
    if (wrapper !== null && (typeof wrapper === "object" || typeof wrapper === "function")) {
      if (wilds.has(wrapper))
        throw new TypeError(print(wrapper)+" marked as wild:"+wilds.get(wrapper)+"\nUsed as wrapper:");
      if (tames.has(wrapper))
        throw new TypeError(print(wrapper)+" marked as tame:"+tames.get(wrapper)+"\nUsed as wrapper:");
      if (!wrappers.has(wrapper)) {
        throw new TypeError("Wrapper unmarked: "+print(wrapper));
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
  membrane.enter = (tame) => {
    check_tame(tame);
    const wrapper = enter(tame);
    if (wrapper !== null && (typeof wrapper === "object" || typeof wrapper === "function"))
      wrappers.set(wrapper, stack());
    check_wrapper(wrapper);
    return wrapper;
  };
  membrane.leave = (wrapper) => {
    check_wrapper(wrapper);
    const tame = leave(wrapper);
    check_tame(tame);
    return tame;
  };
};
