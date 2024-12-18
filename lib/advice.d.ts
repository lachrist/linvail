import { RawValue, Value } from "./runtime/reflect";

export type Advice<X> = {
  capture: (value: Value<X>) => X;
  release: (value: X) => Value<X>;
  internalize: (reference: Value<RawValue>) => Value<X>;
  externalize: (reference: Value<X>) => Value<RawValue>;
  apply: (callee: X, that: X, args: X[]) => X;
  construct: (callee: X, args: X[]) => X;
  sanitizeClosure: (closure: Function) => Value<X>;
};
