import { loadLibrary } from "./library/load.mjs";

export const { is, dir, WeakSet, WeakMap, Map, Set } = loadLibrary({
  missing: "throw",
});
