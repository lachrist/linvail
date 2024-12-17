import { RawValue, Value } from "./reflect";

export type Advice<X> = {
  capture: (value: Value<X>) => X;
  release: (value: X) => Value<X>;
  internalize: (reference: Value<RawValue>) => Value<X>;
  externalize: (reference: Value<X>) => Value<RawValue>;
  apply: (callee: Value<X>, that: X, args: X[]) => X;
  construct: (callee: Value<X>, args: X[], new_target: Value<X>) => Value<X>;
  sanitizeClosure: (closure: Function) => Value<X>;
};
