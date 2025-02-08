var o = { foo: 123 };
Reflect.defineProperty(o, "foo", {
  enumerable: false,
});
console.log(Reflect.getOwnPropertyDescriptor(o, "foo"));
