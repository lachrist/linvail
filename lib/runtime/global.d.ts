import type { Reference, RawValue, RawReference, Value } from "./reflect";
import type { Descriptor } from "./descriptor";

export type Global = {
  Reflect: {
    construct: <X>(
      target: Value<X>,
      args: X[],
      new_target: Value<X>,
    ) => Reference<X>;
    apply: {
      <X>(callee: Value<X>, that: X, args: X[]): X;
      <T, Y>(callee: (this: T) => Y, that: T, args: []): Y;
      <T, X1, Y>(callee: (this: T, x1: X1) => Y, that: T, args: [x1: X1]): Y;
      <T, X1, X2, Y>(
        callee: (this: T, x1: X1, x2: X2) => Y,
        that: T,
        args: [x1: X1, x2: X2],
      ): Y;
      <T, X1, X2, X3, Y>(
        callee: (this: T, x1: X1, x2: X2, x3: X3) => Y,
        that: T,
        args: [x1: X1, x2: X2, x3: X3],
      ): Y;
      <T, X1, X2, X3, X4, Y>(
        callee: (this: T, x1: X1, x2: X2, x3: X3, x4: X4) => Y,
        that: T,
        args: [x1: X1, x2: X2, x3: X3, x4: X4],
      ): Y;
      <T, X, Y>(callee: (this: T, ...xs: X[]) => Y, that: T, args: X[]): Y;
    };
  };
  Object: {
    setPrototypeOf: {
      <X>(target: X[], prototype: Reference<X>): Reference<X>;
      <X>(target: Value<X>, prototype: Value<X>): Value<X>;
    };
    prototype: RawReference;
    create: <X>(
      prototype: Value<X>,
      properties: { [key in PropertyKey]: Descriptor<X> },
    ) => Reference<X>;
    assign: <X>(target: Value<X>, ...sources: Value<X>[]) => Reference<X>;
    keys: <X>(target: Value<X>) => string[];
    values: <X>(target: Value<X>) => X[];
    defineProperty: <X>(
      target: Value<X>,
      key: RawValue,
      descriptor: Descriptor<X>,
    ) => Reference<X>;
    getOwnPropertyDescriptor: <X>(
      target: Value<X>,
      key: RawValue,
    ) => undefined | Descriptor<X>;
  };
  Array: {
    prototype: RawReference;
    of: <X>(...elements: X[]) => X[];
  };
};
