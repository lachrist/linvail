import type { Primitive } from "../util/primitive.d.ts";

/////////////
// WeakSet //
/////////////

export type LinvailWeakSetPrototype = {
  has: <K>(this: LinvailWeakSet<K>, key: K) => boolean;
  delete: <K>(this: LinvailWeakSet<K>, key: K) => boolean;
  add: <K1, K2 extends K1>(
    this: LinvailWeakSet<K1>,
    key: K2,
  ) => LinvailWeakSet<K1>;
};

export type LinvailWeakSet<K> = {
  __brand: "LinvailWeakSet";
  __key: K;
} & LinvailWeakSetPrototype;

export type LinvailWeakSetConstructor = {
  new <K>(keys?: K[]): LinvailWeakSet<K>;
  readonly prototype: LinvailWeakSetPrototype;
};

/////////////
// WeakMap //
/////////////

export type LinvailWeakMapPrototype = {
  has: <K, V>(this: LinvailWeakMap<K, V>, key: K) => boolean;
  delete: <K, V>(this: LinvailWeakMap<K, V>, key: K) => boolean;
  get: <K, V>(this: LinvailWeakMap<K, V>, key: K) => V | undefined;
  set: <K1, V1, K2 extends K1, V2 extends V1>(
    this: LinvailWeakMap<K1, V1>,
    key: K2,
    val: V2,
  ) => LinvailWeakMap<K1, V1>;
};

export type LinvailWeakMap<K, V> = {
  __brand: "LinvailWeakMap";
  __key: K;
  __val: V;
} & LinvailWeakMapPrototype;

export type LinvailWeakMapConstructor = {
  new <K, V>(entries?: [K, V][]): LinvailWeakMap<K, V>;
  readonly prototype: LinvailWeakMapPrototype;
};

/////////
// Set //
/////////

export type LinvailSetPrototype = {
  has: <K>(this: LinvailSet<K>, key: K) => boolean;
  delete: <K>(this: LinvailSet<K>, key: K) => boolean;
  add: <K1, K2 extends K1>(this: LinvailSet<K1>, key: K2) => LinvailSet<K1>;
  clear: <K>(this: LinvailSet<K>) => undefined;
  forEach: <T, K>(
    this: LinvailSet<K>,
    callback: (this: T, key: K, val: K, set: LinvailSet<K>) => void,
    this_arg?: T,
  ) => undefined;
  getSize: <K>(this: LinvailSet<K>) => number;
};

export type LinvailSet<K> = {
  __brand: "LinvailSet";
  __key: K;
} & LinvailSetPrototype;

export type LinvailSetConstructor = {
  new <K>(keys?: K[]): LinvailSet<K>;
  readonly prototype: LinvailSetPrototype;
};

/////////
// Map //
/////////

export type LinvailMapPrototype = {
  getSize: <K, V>(this: LinvailMap<K, V>) => number;
  has: <K, V>(this: LinvailMap<K, V>, key: K) => boolean;
  delete: <K, V>(this: LinvailMap<K, V>, key: K) => boolean;
  get: <K, V>(this: LinvailMap<K, V>, key: K) => V | undefined;
  set: <K1, V1, K2 extends K1, V2 extends V1>(
    this: LinvailMap<K1, V1>,
    key: K2,
    val: V2,
  ) => LinvailMap<K1, V1>;
  clear: <K, V>(this: LinvailMap<K, V>) => undefined;
  forEach: <T, K, V>(
    this: LinvailMap<K, V>,
    callback: (this: T, key: K, val: V, map: LinvailMap<K, V>) => void,
    this_arg?: T,
  ) => undefined;
};

export type LinvailMap<K, V> = {
  __brand: "LinvailMap";
  __key: K;
  __val: V;
} & LinvailMapPrototype;

export type LinvailMapConstructor = {
  new <K, V>(entries?: [K, V][]): LinvailMap<K, V>;
  readonly prototype: LinvailMapPrototype;
};

/////////////
// Library //
/////////////

export type Library = {
  dir: (value: unknown) => undefined;
  is: (value1: unknown, value2: unknown) => boolean;
  isGuestReference: (value: unknown) => value is object;
  WeakSet: LinvailWeakSetConstructor;
  WeakMap: LinvailWeakMapConstructor;
  Set: LinvailSetConstructor;
  Map: LinvailMapConstructor;
  addEventListener: (
    event_name: "capture" | "release",
    listener: (event: Primitive) => void,
  ) => symbol;
  removeEventListener: (
    event_name: "capture" | "release",
    listener_symbol: symbol,
  ) => boolean;
};
