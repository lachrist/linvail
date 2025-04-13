import { loadLibrary } from "./library/load.mjs";

export const {
  is,
  dir,
  getKind,
  addEventListener,
  removeEventListener,
  WeakSet,
  WeakMap,
  Map,
  Set,
} = loadLibrary({ missing: "throw" });
