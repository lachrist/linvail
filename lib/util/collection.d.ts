export type WeakMap<K, V> = {
  readonly __brand: "WeakMap";
  readonly __key: K;
  readonly __val: V;
};

export type Map<K, V> = {
  readonly __brand: "Map";
  readonly __key: K;
  readonly __val: V;
};

export type Set<K> = {
  readonly __brand: "Set";
  readonly __key: K;
};

export type WeakSet<K> = {
  readonly __brand: "WeakSet";
  readonly __key: K;
};
