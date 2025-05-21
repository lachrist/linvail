import { loadLibrary } from "./library/load.mjs";

export const { is, dir, refresh, WeakSet, WeakMap, Map, Set } = loadLibrary({
  missing: "throw",
});
