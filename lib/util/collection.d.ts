export type SafeWeakMap<K, V> = {
  $has(key: K): boolean;
  $get(key: K): V | undefined;
  $set(key: K, val: V): void;
  $delete(key: K): boolean;
};

export type SafeWeakSet<K> = {
  $has(key: K): boolean;
  $add(key: K): void;
  $delete(key: K): boolean;
};

export type SafeMap<K, V> = {
  $has(key: K): boolean;
  $get(key: K): V | undefined;
  $set(key: K, value: V): void;
  $delete(key: K): boolean;
  $clear(): void;
  $forEach(each: (val: V, key: K, map: SafeMap<K, V>) => void): void;
  $getSize(): number;
};

export type SafeSet<K> = {
  $has(key: K): boolean;
  $add(key: K): void;
  $delete(key: K): boolean;
  $clear(): void;
  $forEach(each: (key: K, val: K, set: SafeSet<K>) => void): void;
  $getSize(): number;
};
