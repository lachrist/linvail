import type {
  InternalPrimitive,
  InternalReference,
  InternalValue,
} from "./domain";
import type { Emitter } from "./emitter";

/////////////
// WeakSet //
/////////////

export type LinvailWeakSet = {
  __brand: "LinvailWeakSet";
};

export type LinvailWeakSetPrototype = {
  has: (this: LinvailWeakSet, key: InternalValue) => boolean;
  delete: (this: LinvailWeakSet, key: InternalValue) => boolean;
  add: (this: LinvailWeakSet, key: InternalValue) => void;
};

export type LinvailWeakSetConstructor = (new () => LinvailWeakSet) & {
  prototype: LinvailWeakSetPrototype;
};

/////////////
// WeakMap //
/////////////

export type LinvailWeakMap = {
  __brand: "LinvailWeakMap";
};

export type LinvailWeakMapPrototype = {
  has: (this: LinvailWeakMap, key: InternalValue) => boolean;
  delete: (this: LinvailWeakMap, key: InternalValue) => boolean;
  get: (this: LinvailWeakMap, key: InternalValue) => InternalValue | undefined;
  set: (this: LinvailWeakMap, key: InternalValue, value: InternalValue) => void;
};

export type LinvailWeakMapConstructor = (new () => LinvailWeakMap) & {
  prototype: LinvailWeakMapPrototype;
};

/////////
// Set //
/////////

export type LinvailSet = {
  __brand: "LinvailSet";
};

export type LinvailSetPrototype = {
  has: (this: LinvailSet, key: InternalValue) => boolean;
  delete: (this: LinvailSet, key: InternalValue) => boolean;
  add: (this: LinvailSet, key: InternalValue) => void;
  clear: (this: LinvailSet) => void;
  forEach: (
    this: LinvailSet,
    callback: InternalReference,
    this_arg: InternalValue,
  ) => void;
};

export type LinvailSetConstructor = (new () => LinvailSet) & {
  prototype: LinvailSetPrototype;
};

/////////
// Map //
/////////

export type LinvailMap = {
  __brand: "LinvailMap";
};

export type LinvailMapPrototype = {
  has: (this: LinvailMap, key: InternalValue) => boolean;
  delete: (this: LinvailMap, key: InternalValue) => boolean;
  get: (this: LinvailMap, key: InternalValue) => InternalValue | undefined;
  set: (this: LinvailMap, key: InternalValue, value: InternalValue) => void;
  clear: (this: LinvailMap) => void;
  forEach: (
    this: LinvailMap,
    callback: InternalReference,
    this_arg: InternalValue,
  ) => void;
};

export type LinvailMapConstructor = (new () => LinvailMap) & {
  prototype: LinvailMapPrototype;
};

/////////////
// Runtime //
/////////////

export type Emission = {
  emitCapture: (value: InternalPrimitive) => void;
  emitRelease: (value: InternalPrimitive) => void;
};

export type Linvail = {
  dir: (value: InternalValue) => void;
  same: (value1: InternalValue, value2: InternalValue) => boolean;
  WeakSet: LinvailWeakSetConstructor;
  WeakMap: LinvailWeakMapConstructor;
  Set: LinvailSetConstructor;
  Map: LinvailMapConstructor;
  captures: Emitter<InternalPrimitive>;
  releases: Emitter<InternalPrimitive>;
};
