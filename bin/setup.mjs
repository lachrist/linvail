import { createRuntime } from "../lib/runtime/_.mjs";
import { register } from "node:module";
import { setupile } from "aran";
import { generate } from "astring";
import {
  advice_global_variable,
  intrinsic_global_variable,
  library_global_variable,
} from "./bridge.mjs";
import { dir } from "./console.mjs";

const { eval: globalEval } = globalThis;

const intrinsics = globalEval(
  generate(
    setupile({
      global_object_variable: "globalThis",
      intrinsic_global_variable,
    }),
  ),
);

const { advice, library } = createRuntime(intrinsics, { dir });

/** @type {any} */ (globalThis)[library_global_variable] = library;
/** @type {any} */ (globalThis)[advice_global_variable] = advice;

register("./hook.mjs", import.meta.url);
