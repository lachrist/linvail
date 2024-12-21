import type {
  Reflect,
  Reference,
  RawValue,
  RawReference,
  Value,
} from "./reflect";
import type { Descriptor } from "./descriptor";

export type Global = {
  Reflect: Reflect;
  Object: {
    setPrototypeOf: <X>(target: Value<X>, prototype: Value<X>) => Value<X>;
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
