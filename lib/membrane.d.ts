import { Reference } from "./reflect";

// Cannot use ReferenceValue because of circularity
export type Value<P> = P | { __brand: "Reference"; __inner: Value<P> };

export type ReferenceValue<P> = Reference<Value<P>>;

export type Membrane<I, E> = {
  enter: (value: Value<E>) => Value<I>;
  leave: (value: Value<I>) => Value<E>;
  enterValue: (value: Value<E>) => Value<I>;
  leaveValue: (value: Value<I>) => Value<E>;
  enterPrimitive: (primitive: E) => I;
  leavePrimitive: (primtivie: I) => E;
  enterReference: (reference: ReferenceValue<E>) => ReferenceValue<I>;
  leaveReference: (reference: ReferenceValue<I>) => ReferenceValue<E>;
};
