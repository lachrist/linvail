const p = new Proxy(
  {},
  {
    defineProperty: (target, key, descriptor) => {
      console.log({ target, key, descriptor });
      return Reflect.defineProperty(target, key, descriptor);
    },
  },
);

Reflect.defineProperty(p, "foo", {
  __proto__: null,
  value: 123,
  get: () => 123,
});

console.log(Reflect.getOwnPropertyDescriptor(p, "foo"));
