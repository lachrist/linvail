const p = new Proxy(
  { foo: 123 },
  {
    getOwnPropertyDescriptor: (target, key) => {
      console.log({ target, key });
      return Reflect.getOwnPropertyDescriptor(target, key);
    },
  },
);

console.log(Reflect.getOwnPropertyDescriptor(p, "foo"));
