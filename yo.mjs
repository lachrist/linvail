const p = new Proxy([], {
  defineProperty: (target, key, descriptor) => {
    console.log({ target, key, descriptor });
    return Reflect.defineProperty(target, key, descriptor);
  },
});

Reflect.defineProperty(p, 0, { __proto__: { get: () => {} } });

console.log(Reflect.getOwnPropertyDescriptor(p, 0));
