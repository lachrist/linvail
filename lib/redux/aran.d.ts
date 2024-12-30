import type { RawValue, Reference, Value } from "./reflect";

export type AranLibrary = {
  sliceObject: <X>(
    object: Value<X>,
    exclusion: { [key in PropertyKey]: null },
  ) => { [key in PropertyKey]: X };
  listForInKey: <X>(object: Reference<X>) => string[];
  get: <X>(target: Value<X>, key: RawValue) => X;
  createObject: <X>(
    prototype: Value<X>,
    ...properties: (RawValue | X)[]
  ) => Reference<X>;
};
