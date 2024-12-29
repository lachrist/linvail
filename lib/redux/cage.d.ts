import type { Primitive } from "../primitive";

export type Cage<X> = {
  isHandle: (value: unknown) => value is X;
  capture: (primitive: Primitive) => X;
  release: (handle: X) => Primitive;
};
