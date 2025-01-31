/* eslint-disable local/no-method-call */

import { parse } from "acorn";
import { generate } from "astring";
import { instrument } from "../lib/instrument/_.mjs";
import { setupile, retropile, transpile } from "aran";
import { readFile, writeFile } from "node:fs/promises";
import { argv } from "node:process";
import { createRuntime } from "../lib/runtime/_.mjs";
import { log, dir } from "./console.mjs";

const { eval: evalGlobal } = globalThis;

const LIBRARY_VARIABLE = "Linvail";
const ADVICE_VARIABLE = "_LINVAIL_ADVICE_";
const INTRINSIC_VARIABLE = "_ARAN_INTRINSIC_";
const ESCAPE_PREFIX = "_aran_";

/**
 * @type {import("aran").Digest<{
 *   FilePath: string,
 *   NodeHash: import("aran").EstreeNodePath,
 * }>}
 */
const digest = (_node, node_path, _file_path, _node_kind) => node_path;

/**
 * @type {(
 *   path: string,
 * ) => string}
 */
const toInstPath = (path) => {
  const parts = path.split(".");
  const extension = parts.pop();
  parts.push("inst");
  parts.push(extension);
  return parts.join(".");
};

/**
 * @type {(
 *   path: string
 * ) => string}
 */
const instrumentTarget = async (path1) => {
  const code1 = await readFile(path1, "utf8");
  const root1 = parse(code1, {
    sourceType: "module",
    ecmaVersion: "latest",
  });
  const aran1 = transpile(
    {
      kind: "module",
      path: path1,
      root: root1,
      situ: { type: "global" },
    },
    {
      global_declarative_record: "builtin",
      intrinsic_global_variable: INTRINSIC_VARIABLE,
      digest,
    },
  );
  const aran2 = instrument(aran1, ADVICE_VARIABLE);
  const root2 = retropile(aran2, {
    mode: "normal",
    intrinsic_global_variable: INTRINSIC_VARIABLE,
    escape_prefix: ESCAPE_PREFIX,
  });
  const code2 = generate(root2);
  const path2 = toInstPath(path1);
  await writeFile(path2, code2, "utf8");
  return path2;
};

/**
 * @type {(
 *   path: string
 * ) => string}
 */
const toModuleSpecifier = (path) =>
  path.startsWith("./") ? `.${path}` : `../${path}`;

/**
 * @type {(
 *   argv: string[],
 * ) => Promise<void>}
 */
const main = async (argv) => {
  const target = argv[0];
  const intrinsics = evalGlobal(
    generate(
      setupile({
        intrinsic_global_variable: INTRINSIC_VARIABLE,
      }),
    ),
  );
  const { advice, library } = createRuntime(intrinsics);
  globalThis[ADVICE_VARIABLE] = advice;
  globalThis[LIBRARY_VARIABLE] = library;
  globalThis.console = { log, dir };
  await import(toModuleSpecifier(await instrumentTarget(target)));
};

await main(argv.slice(2));
