import { RawReference, Reference, Value } from "./reflect";

export type LinvailWeakMap<X> = {
  __brand: "LinvailWeakMap";
  __inner: X;
};

export type LinvailMap<X> = {
  __brand: "LinvailMap";
  __inner: X;
};

export type LinvailSet<X> = {
  __brand: "LinvailSet";
  __inner: X;
};

export type LinvailWeakSet<X> = {
  __brand: "LinvailWeakSet";
  __inner: X;
};

export type LinvailWeakSetPrototype = {
  __proto__: RawReference;
  has: <X>(this: LinvailWeakSet<X>, key: X) => boolean;
  delete: <X>(this: LinvailWeakSet<X>, key: X) => boolean;
  add: <X>(this: LinvailWeakSet<X>, key: X) => void;
};

export type LinvailWeakMapPrototype = {
  __proto__: RawReference;
  has: <X>(this: LinvailWeakMap<X>, key: X) => boolean;
  delete: <X>(this: LinvailWeakMap<X>, key: X) => boolean;
  get: <X>(this: LinvailWeakMap<X>, key: X) => X | undefined;
  set: <X>(this: LinvailWeakMap<X>, key: X, value: X) => void;
};

export type LinvailSetPrototype = {
  __proto__: RawReference;
  has: <X>(this: LinvailSet<X>, key: X) => boolean;
  delete: <X>(this: LinvailSet<X>, key: X) => boolean;
  add: <X>(this: LinvailSet<X>, key: X) => void;
  clear: <X>(this: LinvailSet<X>) => void;
  forEach: <X>(this: LinvailSet<X>, callback: Value<X>, this_arg: X) => void;
};

export type LinvailMapPrototype = {
  __proto__: RawReference;
  has: <X>(this: LinvailMap<X>, key: X) => boolean;
  delete: <X>(this: LinvailMap<X>, key: X) => boolean;
  get: <X>(this: LinvailMap<X>, key: X) => X | undefined;
  set: <X>(this: LinvailMap<X>, key: X, value: X) => void;
  clear: <X>(this: LinvailMap<X>) => void;
  forEach: <X>(this: LinvailMap<X>, callback: Value<X>, this_arg: X) => void;
};

export type LinvailIntrinsicRecord = {
  "Linvail.same": <X>(a: X, b: X) => boolean;
  // WeakSet //
  "Linvail.WeakSet": new <X>() => LinvailWeakSet<X>;
  "Linvail.WeakSet.prototype.has": LinvailWeakSetPrototype["has"];
  "Linvail.WeakSet.prototype.delete": LinvailWeakSetPrototype["delete"];
  "Linvail.WeakSet.prototype.add": LinvailWeakSetPrototype["add"];
  // WeakMap //
  "Linvail.WeakMap": new <X>() => LinvailWeakMap<X>;
  "Linvail.WeakMap.prototype.has": LinvailWeakMapPrototype["has"];
  "Linvail.WeakMap.prototype.delete": LinvailWeakMapPrototype["delete"];
  "Linvail.WeakMap.prototype.get": LinvailWeakMapPrototype["get"];
  "Linvail.WeakMap.prototype.set": LinvailWeakMapPrototype["set"];
  // Set //
  "Linvail.Set": new <X>() => LinvailSet<X>;
  "Linvail.Set.prototype.has": LinvailSetPrototype["has"];
  "Linvail.Set.prototype.delete": LinvailSetPrototype["delete"];
  "Linvail.Set.prototype.add": LinvailSetPrototype["add"];
  "Linvail.Set.prototype.clear": LinvailSetPrototype["clear"];
  "Linvail.Set.prototype.forEach": LinvailSetPrototype["forEach"];
  // Map //
  "Linvail.Map": new <X>() => LinvailMap<X>;
  "Linvail.Map.prototype.has": LinvailMapPrototype["has"];
  "Linvail.Map.prototype.delete": LinvailMapPrototype["delete"];
  "Linvail.Map.prototype.get": LinvailMapPrototype["get"];
  "Linvail.Map.prototype.set": LinvailMapPrototype["set"];
  "Linvail.Map.prototype.clear": LinvailMapPrototype["clear"];
  "Linvail.Map.prototype.forEach": LinvailMapPrototype["forEach"];
};

export type Runtime = {
  same: <X>(a: X, b: X) => boolean;
  WeakSet: (new <X>() => LinvailWeakSet<X>) & {
    prototype: LinvailWeakSetPrototype;
  };
  WeakMap: (new <X>() => LinvailWeakMap<X>) & {
    prototype: LinvailWeakMapPrototype;
  };
  Set: (new <X>() => LinvailSet<X>) & { prototype: LinvailSetPrototype };
  Map: (new <X>() => LinvailMap<X>) & { prototype: LinvailMapPrototype };
};
