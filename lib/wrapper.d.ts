export type Primitive =
  | null
  | undefined
  | string
  | number
  | boolean
  | symbol
  | bigint;

export type Wrapper = { __brand: "Wrapper" };
