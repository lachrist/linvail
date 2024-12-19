import { createRuntime } from "../lib/runtime/index.mjs";
import { register } from "node:module";
import { generateSetup } from "aran";
import { generate } from "astring";
import {
  ADVICE_VARIABLE,
  INTRINSIC_VARIABLE,
  LIBRARY_VARIABLE,
} from "./bridge.mjs";
import { wrap, unwrap } from "./wrapper.mjs";
import { log, dir } from "./console.mjs";

globalThis.console = { log, dir };

const { eval: globalEval } = globalThis;

const intrinsics = globalEval(
  generate(
    generateSetup({
      global_variable: "globalThis",
      intrinsic_variable: INTRINSIC_VARIABLE,
    }),
  ),
);

/** @type {import("./wrapper").WrapperCage} */
const cage = {
  // eslint-disable-next-line local/no-method-call, no-use-before-define
  capture: (value) => cage_library.capture(value),
  // eslint-disable-next-line local/no-method-call, no-use-before-define
  release: (handle) => cage_library.release(handle),
};

const { advice, library } = createRuntime(intrinsics, cage);

/**
 * @type {(
 *   & import("../lib/runtime/library").Library
 *   & import("./wrapper").WrapperCage
 * )}
 */
const cage_library = {
  ...library,
  capture: wrap,
  release: unwrap,
};

/** @type {any} */ (globalThis)[LIBRARY_VARIABLE] = cage_library;
/** @type {any} */ (globalThis)[ADVICE_VARIABLE] = advice;

register("./hook.mjs", import.meta.url);
