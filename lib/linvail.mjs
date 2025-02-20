const { Error } = globalThis;

import { library_hidden_variable } from "./library-variable.mjs";

if (!(library_hidden_variable in globalThis)) {
  throw new Error(
    "Missing Linvail library, use: `npx linvail node main.mjs` to preload it.",
  );
}

/** @type {import("./runtime/library").Linvail} */
const library = /** @type {any} */ (globalThis)[library_hidden_variable];

export const {
  is,
  dir,
  addEventListener,
  removeEventListener,
  WeakSet,
  WeakMap,
  Map,
  Set,
} = library;
