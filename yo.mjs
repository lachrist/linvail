const o = {};
Reflect.defineProperty(o, "foo", {
  value: 123,
  writable: true,
  configurable: true,
  enumerable: true,
});
console.log(Reflect.set({}, "foo", 123, o));
