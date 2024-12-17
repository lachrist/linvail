export type Primitive =
  | null
  | undefined
  | string
  | number
  | boolean
  | symbol
  | bigint;

export type Reference = { __brand: "Reference" };

export type Value = Reference | Primitive;
