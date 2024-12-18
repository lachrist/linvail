import { Value } from "./reflect";

export type Cage<X> = {
  capture: (value: Value<X>) => X;
  release: (handle: X) => Value<X>;
};
