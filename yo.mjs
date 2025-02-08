const d = {
  value: 123,
  writable: true,
  enumerable: true,
  configurable: true,
};
const p = new Proxy(
  {},
  {
    getOwnPropertyDescriptor: (target, key, descriptor) => d,
  },
);
console.log(Object.getOwnPropertyDescriptor(p, "foo") === d);
