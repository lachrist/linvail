import { register } from "node:module";
import { dir as dirNode } from "node:console";
import { compileIntrinsicRecord } from "aran/runtime";
import {
  compile,
  advice_global_variable,
  intrinsic_global_variable,
} from "./common.mjs";
import { env, stderr } from "node:process";
import { listConfigWarning, toConfig } from "./config.mjs";
import { runInThisContext } from "node:vm";
import {
  createCustomAdvice,
  createRegion,
  internalizeGuestReference,
} from "../lib/runtime.mjs";

const {
  String,
  Reflect: { apply },
  JSON: { parse },
  Array: {
    from: toArray,
    prototype: { join },
  },
} = globalThis;

const dir = (/** @type {unknown} */ value) => {
  dirNode(value, { showProxy: true, showHidden: true });
};

/**
 * @type {(
 *   options: {
 *     count: boolean,
 *   },
 * ) => Partial<import("../lib/runtime/config.d.ts").RegionConfig>}
 */
export const compileRuntimeConfig = ({ count }) => {
  if (count) {
    let count = 0;
    return {
      dir,
      wrapPrimitive: (primitive) => ({
        __proto__: null,
        type: "primitive",
        inner: primitive,
        index: count++,
      }),
      wrapGuestReference: (reference, name) => ({
        type: "guest",
        inner: reference,
        name,
        index: count++,
      }),
      wrapHostReference: (reference, kind) => ({
        type: "host",
        kind,
        inner: null,
        plain: reference,
        index: count++,
      }),
    };
  } else {
    return { dir };
  }
};

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
 *   config: import("./config.d.ts").Config,
 * ) => void}
 */
const setup = (evalScript, { global_dynamic_code, global_object, count }) => {
  const { trans, weave, retro } = compile({ global_object });
  const intrinsics = compileIntrinsicRecord(globalThis);
  /** @type {any} */ (globalThis)[intrinsic_global_variable] = intrinsics;
  if (global_dynamic_code === "internal") {
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
  const region = createRegion(intrinsics, compileRuntimeConfig({ count }));
  const advice = createCustomAdvice(region, { weaveEvalProgram: weave });
  evalScript(
    `
      let ${advice_global_variable};
      (advice) => { ${advice_global_variable} = advice; };
    `,
  )(advice);
  /**
   * @type {(
   *   code: string,
   *   situ: string,
   *   hash: number | string,
   * ) => import("aran").Program<import("aran").Atom>}
   */
  const transpileEvalCode = (code, situ, hash) =>
    trans(`dynamic://eval/local/${hash}`, "eval", parse(situ), code);
  intrinsics["aran.transpileEvalCode"] = transpileEvalCode;
  intrinsics["aran.retropileEvalCode"] = retro;
  if (global_object === "internal") {
    {
      /** @type {import("../lib/linvail.d.ts").GuestReference} */
      const external1 = /** @type {any} */ (
        intrinsics["aran.global_declarative_record"]
      );
      const internal = internalizeGuestReference(region, external1, {
        prototype: "none",
      });
      intrinsics["aran.global_declarative_record"] = internal.inner;
    }
    {
      /** @type {import("../lib/linvail.d.ts").GuestReference} */
      const external1 = /** @type {any} */ (intrinsics.globalThis);
      const internal = internalizeGuestReference(region, external1, {
        prototype: "Object.prototype",
      });
      /** @type {typeof globalThis} */
      const external2 = /** @type {any} */ (internal.inner);
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
