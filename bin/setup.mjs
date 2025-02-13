import { createRuntime } from "../lib/runtime/_.mjs";
import { register } from "node:module";
import { setupile } from "aran";
import { generate } from "astring";
import { dir } from "./console.mjs";
import {
  advice_global_variable,
  compile,
  intrinsic_global_variable,
  library_global_variable,
} from "./common.mjs";
import { env } from "node:process";
import { toConfig } from "./config.mjs";

const {
  String,
  Reflect: { apply },
  eval: globalEval,
  JSON: { parse },
  Array: {
    from: toArray,
    prototype: { join },
  },
} = globalThis;

/**
 * @type {(
 *   parts: unknown[],
 * ) => string}
 */
const compileFunctionCode = (parts) => {
  const { length } = parts;
  if (length === 0) {
    return "(function anonymous() {\n})";
  } else {
    const params = toArray(
      /** @type {ArrayLike<undefined>} */ ({
        __proto__: null,
        length: parts.length - 1,
      }),
      (_, index) => String(parts[index]),
    );
    const body = String(parts[parts.length - 1]);
    return `(function anonymous(${apply(join, params, [","])}\n) {\n${body}\n})`;
  }
};

/**
 * @type {(
 *   config: import("./config").Config,
 * ) => {
 *   library: import("../lib/_").Linvail,
 *   advice: import("../lib/_").Advice,
 * }}
 */
const setup = ({
  instrument_dynamic_code,
  global_declarative_record,
  global_object,
}) => {
  const { trans, weave, retro } = compile({ global_declarative_record });
  /**
   * @type {import("aran").IntrinsicRecord}
   */
  const intrinsics = globalEval(
    generate(
      setupile({
        global_object_variable: "globalThis",
        intrinsic_global_variable,
      }),
    ),
  );
  if (instrument_dynamic_code) {
    const {
      Reflect: { apply: applyIntrinsic, construct: constructIntrinsic },
      eval: evalIntrinsic,
      Function: FunctionIntrinsic,
    } = intrinsics.globalThis;
    /**
     * @type {(
     *   target: unknown,
     *   that: unknown,
     *   input: unknown[],
     * ) => unknown}
     */
    const apply = (target, that, input) => {
      if (
        target === evalIntrinsic &&
        input.length > 0 &&
        typeof input[0] === "string"
      ) {
        return evalIntrinsic(
          retro(
            weave(
              trans(
                "dynamic://eval-global",
                "eval",
                { type: "global" },
                input[0],
              ),
            ),
          ),
        );
      }
      if (target === FunctionIntrinsic) {
        return evalIntrinsic(
          retro(
            weave(
              trans(
                "dynamic://function",
                "eval",
                { type: "global" },
                compileFunctionCode(input),
              ),
            ),
          ),
        );
      }
      return applyIntrinsic(/** @type {Function} */ (target), that, input);
    };
    intrinsics.globalThis.Reflect.apply = /** @type {any} */ (apply);
    /**
     * @type {(
     *   target: unknown,
     *   input: unknown[],
     *   new_target?: unknown,
     * ) => unknown}
     */
    const construct = (target, input, ...rest) => {
      if (target === FunctionIntrinsic) {
        return evalIntrinsic(
          retro(
            weave(
              trans(
                "dynamic://function",
                "eval",
                { type: "global" },
                compileFunctionCode(input),
              ),
            ),
          ),
        );
      }
      if (rest.length === 0) {
        return constructIntrinsic(/** @type {Function} */ (target), input);
      } else {
        return constructIntrinsic(
          /** @type {Function} */ (target),
          input,
          /** @type {Function} */ (rest[0]),
        );
      }
    };
    intrinsics.globalThis.Reflect.construct = /** @type {any} */ (construct);
  }
  const { advice, library } = createRuntime(intrinsics, { dir });
  if (instrument_dynamic_code) {
    advice.weaveEvalProgram = weave;
    intrinsics["aran.transpileEvalCode"] = (code, situ, hash) =>
      trans(`dynamic://eval/local/${hash}`, "eval", parse(situ), code);
    intrinsics["aran.retropileEvalCode"] = retro;
  }
  if (global_declarative_record === "internal") {
    const { internalize } = advice;
    /** @type {import("../lib/_").PlainExternalReference} */
    const external = /** @type {any} */ (
      intrinsics["aran.global_declarative_record"]
    );
    const internal = internalize(external);
    intrinsics["aran.global_declarative_record"] = internal;
  }
  if (global_object === "internal") {
    const { internalize } = advice;
    /** @type {import("../lib/_").PlainExternalReference} */
    const external = /** @type {any} */ (intrinsics.globalThis);
    const internal = internalize(external);
    intrinsics.globalThis = /** @type {any} */ (internal);
    intrinsics["aran.global_object"] = /** @type {any} */ (internal);
  }
  return {
    advice,
    // eslint-disable-next-line object-shorthand
    library: /** @type {any} */ (library),
  };
};

{
  const { advice, library } = setup(toConfig(env));
  /** @type {any} */ (globalThis)[library_global_variable] = library;
  /** @type {any} */ (globalThis)[advice_global_variable] = advice;
  register("./hook.mjs", import.meta.url);
}
