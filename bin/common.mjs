import { parse } from "acorn";
import { generate } from "astring";
import { weave as weaveCustom } from "../lib/instrument.mjs";
import { retropile, transpile } from "aran";

const { Error } = globalThis;

export const advice_global_variable = "__LINVAIL_ADVICE__";

export const intrinsic_global_variable = "__LINVAIL_INTRINSIC__";

const escape_prefix = "__ARAN_";

/**
 * @type {import("aran").Digest<{
 *   FilePath: string,
 *   NodeHash: import("aran").EstreeNodePath,
 * }>}
 */
const digest = (_node, node_path, _file_path, _node_kind) => node_path;

/**
 * @type {(
 *   region: "internal" | "external",
 * ) => "emulate" | "builtin"}
 */
const toGlobalDeclarativeRecord = (region) => {
  switch (region) {
    case "internal": {
      return "emulate";
    }
    case "external": {
      return "builtin";
    }
    default: {
      throw new Error(`Invalid region: ${region}`);
    }
  }
};

/**
 * @type {(
 *   config: {
 *     global_object: "internal" | "external",
 *   },
 * ) => {
 *   trans: (
 *     path: string,
 *     kind: "module" | "script" | "eval",
 *     situ: import("aran").Situ,
 *     code: string,
 *   ) => import("aran").Program,
 *   weave: (
 *     root: import("aran").Program,
 *   ) => import("aran").Program,
 *   retro: (
 *     root: import("aran").Program,
 *   ) => string,
 * }}
 */
export const compile = ({ global_object }) => ({
  weave: (root) => weaveCustom(root, { advice_global_variable }),
  trans: (path, kind, situ, code) =>
    transpile(
      {
        path,
        kind,
        situ,
        root: parse(code, {
          sourceType: kind === "eval" ? "script" : kind,
          ecmaVersion: "latest",
        }),
      },
      {
        global_declarative_record: toGlobalDeclarativeRecord(global_object),
        digest,
      },
    ),
  retro: (root) =>
    generate(
      retropile(root, {
        mode: "normal",
        global_object_variable: "globalThis",
        intrinsic_global_variable,
        escape_prefix,
      }),
    ),
});
