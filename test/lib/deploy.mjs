import { argv } from "node:process";
import { dir as dirNode } from "node:console";
import { parse } from "acorn";
import { generate } from "astring";
import { weave } from "../../lib/instrument.mjs";
import { setupile, retropile, transpile } from "aran";
import { readFile, writeFile } from "node:fs/promises";
import { createRuntime } from "../../lib/runtime/runtime.mjs";
import { library_hidden_variable } from "../../lib/library/library-variable.mjs";

const { eval: evalGlobal, Error } = globalThis;

/** @type {(value: unknown) => void} */
const dir = (value) => {
  dirNode(value, { showProxy: true, showHidden: true });
};

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
  if (extension == null) {
    throw new Error("Invalid path", { cause: { path } });
  }
  parts.push("inst");
  parts.push(extension);
  return parts.join(".");
};

/**
 * @type {(
 *   path: string
 * ) => Promise<string>}
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
      digest,
    },
  );
  const aran2 = weave(aran1, { advice_global_variable: ADVICE_VARIABLE });
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
const toModuleSpecifier = (path) => `../../${path}`;

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
  let counter = 0;
  const { advice, library } = createRuntime(intrinsics, {
    dir,
    wrapPrimitive: (inner) => ({
      type: "primitive",
      inner,
      index: counter++,
    }),
  });
  /** @type {any} */ (globalThis)[ADVICE_VARIABLE] = advice;
  /** @type {any} */ (globalThis)[library_hidden_variable] = library;
  await import(toModuleSpecifier(await instrumentTarget(target)));
};

await main(argv.slice(2));
