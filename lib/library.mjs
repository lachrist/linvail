import { loadLibrary } from "./library/load.mjs";

export const {
  is,
  dir,
  isGuestReference,
  addEventListener,
  removeEventListener,
  WeakSet,
  WeakMap,
  Map,
  Set,
} = loadLibrary({ missing: "throw" });
