import type { RawValue, Value } from "./reflect";

/////////////
// WeakSet //
/////////////

export type LinvailWeakSet<X> = {
  __brand: "LinvailWeakSet";
  __inner: X;
};

export type LinvailWeakSetPrototype = {
  has: <X>(this: LinvailWeakSet<X>, key: X) => boolean;
  delete: <X>(this: LinvailWeakSet<X>, key: X) => boolean;
  add: <X>(this: LinvailWeakSet<X>, key: X) => void;
};

export type LinvailWeakSetConstructor = (new <X>() => LinvailWeakSet<X>) & {
  prototype: LinvailWeakSetPrototype;
};

/////////////
// WeakMap //
/////////////

export type LinvailWeakMap<X> = {
  __brand: "LinvailWeakMap";
  __inner: X;
};

export type LinvailWeakMapPrototype = {
  has: <X>(this: LinvailWeakMap<X>, key: X) => boolean;
  delete: <X>(this: LinvailWeakMap<X>, key: X) => boolean;
  get: <X>(this: LinvailWeakMap<X>, key: X) => X | undefined;
  set: <X>(this: LinvailWeakMap<X>, key: X, value: X) => void;
};

export type LinvailWeakMapConstructor = (new <X>() => LinvailWeakMap<X>) & {
  prototype: LinvailWeakMapPrototype;
};

/////////
// Set //
/////////

export type LinvailSet<X> = {
  __brand: "LinvailSet";
  __inner: X;
};

export type LinvailSetPrototype = {
  has: <X>(this: LinvailSet<X>, key: X) => boolean;
  delete: <X>(this: LinvailSet<X>, key: X) => boolean;
  add: <X>(this: LinvailSet<X>, key: X) => void;
  clear: <X>(this: LinvailSet<X>) => void;
  forEach: <X>(this: LinvailSet<X>, callback: Value<X>, this_arg: X) => void;
};

export type LinvailSetConstructor = (new <X>() => LinvailSet<X>) & {
  prototype: LinvailSetPrototype;
};

/////////
// Map //
/////////

export type LinvailMap<X> = {
  __brand: "LinvailMap";
  __inner: X;
};

export type LinvailMapPrototype = {
  has: <X>(this: LinvailMap<X>, key: X) => boolean;
  delete: <X>(this: LinvailMap<X>, key: X) => boolean;
  get: <X>(this: LinvailMap<X>, key: X) => X | undefined;
  set: <X>(this: LinvailMap<X>, key: X, value: X) => void;
  clear: <X>(this: LinvailMap<X>) => void;
  forEach: <X>(this: LinvailMap<X>, callback: Value<X>, this_arg: X) => void;
};

export type LinvailMapConstructor = (new <X>() => LinvailMap<X>) & {
  prototype: LinvailMapPrototype;
};

/////////////
// Runtime //
/////////////

export type Library = {
  same: <X>(x1: X, x2: X) => boolean;
  _inspect: <X>(x: X) => string;
  inspect: <X>(this: RawValue, x: X) => string;
  WeakSet: LinvailWeakSetConstructor;
  WeakMap: LinvailWeakMapConstructor;
  Set: LinvailSetConstructor;
  Map: LinvailMapConstructor;
};
