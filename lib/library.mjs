import { loadLibrary } from "./library/load.mjs";

export const { is, dir, getKind, WeakSet, WeakMap, Map, Set } = loadLibrary({
  missing: "throw",
});
