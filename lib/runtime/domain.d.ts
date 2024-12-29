import type { Primitive } from "../primitive";

export type Reference<X> = { __brand: "Reference"; __inner: X };

export type Value<X> = Primitive | Reference<X>;

// TypeScript fails to handle this cyclic type definition
// export type RawReference = Reference<RawValue>;
export type RawReference = { __brand: "Reference"; __inner: RawValue };

export type RawValue = Primitive | RawReference;
