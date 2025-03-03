import { loadLibrary } from "./library/load.mjs";
export * from "./runtime.mjs";
export * from "./instrument.mjs";

export const {
  is,
  dir,
  addEventListener,
  removeEventListener,
  WeakSet,
  WeakMap,
  Map,
  Set,
} = loadLibrary({ missing: "stub" });
