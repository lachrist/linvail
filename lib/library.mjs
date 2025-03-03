import { loadLibrary } from "./library/load.mjs";

export const {
  is,
  dir,
  addEventListener,
  removeEventListener,
  WeakSet,
  WeakMap,
  Map,
  Set,
} = loadLibrary({ missing: "throw" });
