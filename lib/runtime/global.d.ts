import { Reflect, Reference, RawValue, RawReference, Value } from "./reflect";
import { Membrane, Proxy } from "./membrane";
import { Cage } from "./cage";
import { Descriptor } from "./descriptor";
import { Primitive } from "../primitive";

export type Global = {
  Reflect: Reflect;
  Object: {
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
