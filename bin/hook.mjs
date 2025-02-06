import { parse } from "acorn";
import { generate } from "astring";
import { weave } from "../lib/instrument/_.mjs";
import {
  advice_global_variable,
  escape_prefix,
  intrinsic_global_variable,
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
 *   FilePath: string,
 *   NodeHash: import("aran").EstreeNodePath,
 * }>}
 */
const digest = (_node, node_path, _file_path, _node_kind) => node_path;

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
     *   import("aran").EstreeNodePath
     * >}
     */
    const aran1 = transpile(
      {
        kind: "module",
        path: url,
        situ: { type: "global" },
        root: root1,
      },
      { global_declarative_record: "builtin", digest },
    );
    const aran2 = weave(aran1, { advice_global_variable });
    const root2 = retropile(aran2, {
      mode: "normal",
      global_object_variable: "globalThis",
      intrinsic_global_variable,
      escape_prefix,
    });
    result.source = generate(root2);
    // eslint-disable-next-line local/no-method-call
    const path = `./test/codebase/${url.split("/").pop()}`;
    log(`SOURCE MAPPING >> ${path}`);
    writeFileSync(path, result.source, "utf8");
  }
  return result;
};
