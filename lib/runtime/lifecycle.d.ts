import { Value } from "./reflect";

export type Lifecycle<X> = {
  capture: (value: Value<X>) => X;
  release: (handle: X) => Value<X>;
};
