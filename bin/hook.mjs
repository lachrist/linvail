import { parse } from "acorn";
import { generate } from "astring";
// @ts-ignore
import { unbuild } from "aran/lib/unbuild/index.mjs";
// @ts-ignore
import { rebuild } from "aran/lib/rebuild/index.mjs";
import { instrument } from "../lib/instrument/_.mjs";
import {
  ADVICE_VARIABLE,
  ESCAPE_PREFIX,
  INTRINSIC_VARIABLE,
} from "./bridge.mjs";
import { annotateModuleProgram, ROOT_PATH } from "estree-sentry";
import { log, dir } from "./console.mjs";
import { writeFileSync } from "node:fs";

globalThis.console = { log, dir };

const {
  Reflect: { apply },
  TextDecoder,
  TextDecoder: {
    prototype: { decode },
  },
} = globalThis;

const decoder = new TextDecoder("utf-8");

/**
 * @type {import("node:module").LoadHook}
 */
export const load = async (url, context, nextLoad) => {
  const result = await nextLoad(url, context);
  if (result.format === "module") {
    if (typeof result.source !== "string") {
      result.source = apply(decode, decoder, [result.source]);
    }
    const root1 = parse(result.source, {
      sourceType: "module",
      ecmaVersion: "latest",
    });
    const { root: aran1 } = unbuild(
      {
        kind: "module",
        situ: { type: "global" },
        root: annotateModuleProgram(root1, ROOT_PATH, (_node, path, _kind) => ({
          _hash: path,
        })),
      },
      { global_declarative_record: "builtin" },
    );
    const aran2 = instrument(aran1, ADVICE_VARIABLE);
    const { root: root2 } = rebuild(
      { root: aran2 },
      {
        mode: "normal",
        global_variable: "globalThis",
        advice_variable: ADVICE_VARIABLE,
        intrinsic_variable: INTRINSIC_VARIABLE,
        escape_prefix: ESCAPE_PREFIX,
      },
    );
    result.source = generate(root2);
    writeFileSync(
      // eslint-disable-next-line local/no-method-call
      `./test/codebase/${url.split("/").pop()}`,
      result.source,
      "utf8",
    );
  }
  return result;
};
