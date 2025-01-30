import { parse } from "acorn";
import { generate } from "astring";
import { instrument } from "../lib/instrument/_.mjs";
import {
  ADVICE_VARIABLE,
  ESCAPE_PREFIX,
  INTRINSIC_VARIABLE,
} from "./bridge.mjs";
import { log, dir } from "./console.mjs";
import { writeFileSync } from "node:fs";
import { retropile, transpile } from "aran";

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
 * @type {import("aran").Digest<{
 *   FilePath: import("./digest").FilePath,
 *   NodeHash: import("./digest").NodeHash,
 * }>}
 */
const digest = (_node, node_path, _file_path, _node_kind) =>
  /** @type {import("./digest").NodeHash} */ (
    /** @type {string} */ (node_path)
  );

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
    /**
     * @type {import("../lib/instrument/type").Program<
     *   import("./digest").NodeHash
     * >}
     */
    const aran1 = transpile(
      {
        kind: "module",
        path: /** @type {import("./digest").FilePath} */ (url),
        situ: { type: "global" },
        root: root1,
      },
      { global_declarative_record: "builtin", digest },
    );
    const aran2 = instrument(aran1, ADVICE_VARIABLE);
    const root2 = retropile(aran2, {
      mode: "normal",
      global_object_variable: "globalThis",
      intrinsic_global_variable: INTRINSIC_VARIABLE,
      escape_prefix: ESCAPE_PREFIX,
    });
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
