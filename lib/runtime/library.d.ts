import type {
  InternalPrimitive,
  InternalReference,
  InternalValue,
} from "./domain";
import type { Emitter } from "./emitter";

/////////////
// WeakSet //
/////////////

export type LinvailWeakSetPrototype = {
  has: (this: LinvailWeakMap, key: InternalValue) => boolean;
  delete: (this: LinvailWeakMap, key: InternalValue) => boolean;
  add: (this: LinvailWeakMap, key: InternalValue) => LinvailWeakMap;
};

export type LinvailWeakSet = {
  __brand: "LinvailWeakSet";
} & LinvailWeakSetPrototype;

export type LinvailWeakSetConstructor = {
  new (): LinvailWeakSet;
  readonly prototype: LinvailWeakSetPrototype;
};

/////////////
// WeakMap //
/////////////

export type LinvailWeakMapPrototype = {
  has: (this: LinvailWeakMap, key: InternalValue) => boolean;
  delete: (this: LinvailWeakMap, key: InternalValue) => boolean;
  get: (this: LinvailWeakMap, key: InternalValue) => InternalValue | undefined;
  set: (
    this: LinvailWeakMap,
    key: InternalValue,
    value: InternalValue,
  ) => LinvailWeakMap;
};

export type LinvailWeakMap = {
  __brand: "LinvailWeakMap";
} & LinvailWeakMapPrototype;

export type LinvailWeakMapConstructor = {
  new (): LinvailWeakMap;
  readonly prototype: LinvailWeakMapPrototype;
};

/////////
// Set //
/////////

export type LinvailSetPrototype = {
  has: (this: LinvailSet, key: InternalValue) => boolean;
  delete: (this: LinvailSet, key: InternalValue) => boolean;
  add: (this: LinvailSet, key: InternalValue) => LinvailSet;
  clear(this: LinvailSet): undefined;
  forEach(
    this: LinvailSet,
    callback: InternalReference,
    this_arg: InternalValue,
  ): undefined;
};

export type LinvailSet = { __brand: "LinvailSet" } & LinvailSetPrototype;

export type LinvailSetConstructor = {
  new (): LinvailSet;
  readonly prototype: LinvailSetPrototype;
};

/////////
// Map //
/////////

export type LinvailMapPrototype = {
  has: (this: LinvailMap, key: InternalValue) => boolean;
  delete: (this: LinvailMap, key: InternalValue) => boolean;
  get: (this: LinvailMap, key: InternalValue) => InternalValue | undefined;
  set: (
    this: LinvailMap,
    key: InternalValue,
    value: InternalValue,
  ) => LinvailMap;
  clear: (this: LinvailMap) => undefined;
  forEach: (
    this: LinvailMap,
    callback: InternalReference,
    this_arg: InternalValue,
  ) => undefined;
};

export type LinvailMap = { __brand: "LinvailMap" } & LinvailMapPrototype;

export type LinvailMapConstructor = {
  new (): LinvailMap;
  readonly prototype: LinvailMapPrototype;
};

/////////////
// Runtime //
/////////////

export type Emission = {
  emitCapture: (value: InternalPrimitive) => void;
  emitRelease: (value: InternalPrimitive) => void;
};

export type Linvail = {
  dir: (value: InternalValue) => undefined;
  same: (value1: InternalValue, value2: InternalValue) => boolean;
  WeakSet: LinvailWeakSetConstructor;
  WeakMap: LinvailWeakMapConstructor;
  Set: LinvailSetConstructor;
  Map: LinvailMapConstructor;
  captures: Emitter<InternalPrimitive>;
  releases: Emitter<InternalPrimitive>;
};
