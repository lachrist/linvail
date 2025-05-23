/* eslint-disable object-shorthand */

import { LinvailTypeError } from "../error.mjs";
import { library_hidden_variable } from "./library-variable.mjs";

const { Error } = globalThis;

const message =
  "Linvail library is disabled, use: `npx linvail node main.mjs` to enable it.";

/**
 * @type {import("./library.d.ts").Library}
 */
const stub = {
  is: (_value1, _value2) => {
    throw new Error(message);
  },
  dir: (_value) => {
    throw new Error(message);
  },
  refresh: (_value) => {
    throw new Error(message);
  },
  Set: /** @type {any} */ (
    function (/** @type {any} */ _keys) {
      throw new Error(message);
    }
  ),
  WeakSet: /** @type {any} */ (
    function (/** @type {any} */ _keys) {
      throw new Error(message);
    }
  ),
  Map: /** @type {any} */ (
    function (/** @type {any} */ _entries) {
      throw new Error(message);
    }
  ),
  WeakMap: /** @type {any} */ (
    function (/** @type {any} */ _entries) {
      throw new Error(message);
    }
  ),
};

/**
 * @type {(
 *   config: {
 *     missing: "stub" | "throw",
 *   },
 * ) => import("./library.d.ts").Library}
 */
export const loadLibrary = ({ missing }) => {
  if (library_hidden_variable in globalThis) {
    return /** @type {any} */ (globalThis)[library_hidden_variable];
  } else {
    if (missing === "throw") {
      throw new Error(message);
    } else if (missing === "stub") {
      return stub;
    } else {
      throw new LinvailTypeError(missing);
    }
  }
};
