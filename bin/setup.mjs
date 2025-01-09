import { createRuntime } from "../lib/runtime/_.mjs";
import { register } from "node:module";
import { generateSetup } from "aran";
import { generate } from "astring";
import {
  ADVICE_VARIABLE,
  INTRINSIC_VARIABLE,
  LIBRARY_VARIABLE,
} from "./bridge.mjs";
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

const { advice, library } = createRuntime(intrinsics);

/** @type {any} */ (globalThis)[LIBRARY_VARIABLE] = library;
/** @type {any} */ (globalThis)[ADVICE_VARIABLE] = advice;

register("./hook.mjs", import.meta.url);
