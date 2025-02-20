import { createRuntime } from "../lib/runtime.mjs";
import { register } from "node:module";
import { setupile } from "aran";
import { generate } from "astring";
import { dir } from "./console.mjs";
import {
  advice_global_variable,
  compile,
  intrinsic_global_variable,
} from "./common.mjs";
import { library_hidden_variable } from "../lib/library-variable.mjs";
import { env, stderr } from "node:process";
import { listConfigWarning, toConfig } from "./config.mjs";
import { runInThisContext } from "node:vm";

const {
  String,
  Reflect: { apply, defineProperty },
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
 *   evalScript: (code: string) => any,
 *   config: import("./config").Config,
 * ) => void}
 */
const setup = (evalScript, { instrument_global_dynamic_code, global }) => {
  const { trans, weave, retro } = compile({ global });
  /**
   * @type {import("aran").IntrinsicRecord}
   */
  const intrinsics = evalScript(
    generate(
      setupile({
        global_object_variable: "globalThis",
        intrinsic_global_variable,
      }),
    ),
  );
  if (instrument_global_dynamic_code) {
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
  evalScript(
    `
      let ${advice_global_variable};
      (advice) => { ${advice_global_variable} = advice; };
    `,
  )(advice);
  const descriptor = {
    __proto__: null,
    value: library,
    writable: true,
    enumerable: false,
    configurable: true,
  };
  defineProperty(intrinsics.globalThis, library_hidden_variable, descriptor);
  advice.weaveEvalProgram = weave;
  intrinsics["aran.transpileEvalCode"] = (code, situ, hash) =>
    trans(`dynamic://eval/local/${hash}`, "eval", parse(situ), code);
  intrinsics["aran.retropileEvalCode"] = retro;
  if (global === "internal") {
    const { internalize, leavePlainInternalReference } = advice;
    {
      /** @type {import("linvail").PlainExternalReference} */
      const external1 = /** @type {any} */ (
        intrinsics["aran.global_declarative_record"]
      );
      const internal = internalize(external1, {
        prototype: null,
      });
      const external2 = leavePlainInternalReference(internal);
      intrinsics["aran.global_declarative_record"] = external2;
    }
    {
      /** @type {import("linvail").PlainExternalReference} */
      const external1 = /** @type {any} */ (intrinsics.globalThis);
      const internal = internalize(external1, {
        prototype: "global.Object.prototype",
      });
      /** @type {typeof globalThis} */
      const external2 = /** @type {any} */ (
        leavePlainInternalReference(internal)
      );
      intrinsics.globalThis = external2;
      intrinsics["aran.global_object"] = external2;
    }
  }
};

{
  const config = toConfig(env);
  for (const warning of listConfigWarning(config)) {
    stderr.write(`Warning: ${warning}\n`);
  }
  setup(runInThisContext, config);
  register("./hook.mjs", import.meta.url);
}
