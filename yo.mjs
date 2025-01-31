const { eval: evalGlobal } = globalThis;

for (const prototype of [evalGlobal("({});")]) {
  for (const set of /** @type {((this: { arg: number }, arg: number) => void)[]} */ ([
    function (arg) {
      this.arg = arg;
    },
    evalGlobal("'use strict'; (function (arg) { this.arg = arg; });"),
  ])) {
    const descriptor = {
      __proto__: null,
      set,
      configurable: false,
    };
    console.log(Reflect.defineProperty(prototype, "foo", descriptor));
    // const target = { __proto__: prototype };
    // const receiver = { arg: 123 };
    // assertEqual(Reflect.set(target, "foo", 456, receiver), true);
    // assertEqual(receiver.arg, 456);
  }
}
