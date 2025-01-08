import { Map } from "../../collection.mjs";
import { LinvailExecError } from "../../error.mjs";
import { concat2, map } from "../../util.mjs";
import AranOracleMapping from "./aran.mjs";
import GlobalOracleMapping from "./global/index.mjs";

const {
  Object: { entries: listEntry, hasOwn },
  Reflect: { apply },
  String: {
    prototype: { split },
  },
} = globalThis;

/**
 * @type {import("./index").OracleEntry[]}
 */
const aran_entry_array = listEntry(AranOracleMapping);

/**
 * @type {import("./index").OracleEntry[]}
 */
const global_entry_array = listEntry(GlobalOracleMapping);

const separator = ["."];

/**
 * @type {(
 *   intrinsics: import("aran/lib/lang/syntax").AranIntrinsicRecord,
 *   path: string,
 *   oracle: import("./index").Oracle,
 * ) => [
 *   import("../domain").PlainExternalReference,
 *   import("./index").Oracle,
 * ]}
 */
const makeAranEntry = (intrinsics, path, oracle) => {
  if (hasOwn(intrinsics, path)) {
    return [/** @type {any} */ (intrinsics)[path], oracle];
  } else {
    throw new LinvailExecError("Missing path", {
      intrinsics,
      path,
      oracle,
    });
  }
};

/**
 * @type {(
 *   root: typeof globalThis,
 *   path: string,
 *   oracle: import("./index").Oracle,
 * ) => [
 *   import("../domain").PlainExternalReference,
 *   import("./index").Oracle,
 * ]}
 */
const makeGlobalEntry = (root, path, oracle) => {
  const segments = apply(split, path, separator);
  /** @type {any} */
  let current = root;
  const { length } = segments;
  for (let index = 0; index < length; index++) {
    const segment = segments[index];
    if (!hasOwn(current, segment)) {
      throw new LinvailExecError("Missing path", {
        root,
        path,
        oracle,
      });
    }
    current = current[segment];
  }
  return [current, oracle];
};

/**
 * @type {(
 *   intrinsics: import("aran/lib/lang/syntax").AranIntrinsicRecord,
 * ) => import("./index").OracleRegistery}
 */
export const createOracleRegistery = (intrinsics) =>
  new Map(
    concat2(
      map(aran_entry_array, ({ 0: path, 1: oracle }) =>
        makeAranEntry(intrinsics, path, oracle),
      ),
      map(global_entry_array, ({ 0: path, 1: oracle }) =>
        makeGlobalEntry(intrinsics["aran.global"], path, oracle),
      ),
    ),
  );
