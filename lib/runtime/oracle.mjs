import { aran_oracle_record } from "./oracle/aran.mjs";
import { array_oracle_record } from "./oracle/array.mjs";
import { object_oracle_record } from "./oracle/object.mjs";
import { linvail_oracle_record } from "./oracle/linvail.mjs";
import { reflect_oracle_record } from "./oracle/reflect.mjs";
import { LinvailExecError } from "../error.mjs";
import { listEntry } from "../util/record.mjs";
import { wrapFreshGuestReference } from "./region/core.mjs";
import { isPrimitive } from "./domain.mjs";

const {
  Reflect: { apply },
  String: {
    prototype: { split },
  },
} = globalThis;

export const oracle_record = {
  ...aran_oracle_record,
  ...object_oracle_record,
  ...linvail_oracle_record,
  ...array_oracle_record,
  ...reflect_oracle_record,
};

const DOT = ["."];

/**
 * @type {(
 *   root: {
 *     global: typeof globalThis,
 *     aran: import("aran").ExtraIntrinsicRecord,
 *     linvail: import("../linvail.d.ts").Library,
 *   },
 *   name: string,
 * ) => (
 *   | import("./domain.d.ts").Primitive
 *   | import("./domain.d.ts").GuestReference
 * )}
 */
const fetchIntrinsic = (root, name) => {
  /** @type {string[]} */
  const parts = apply(split, name, DOT);
  if (parts.length === 0) {
    throw new LinvailExecError("Empty intrinsic name", { name, root });
  }
  const namespace = parts[0];
  if (namespace === "aran") {
    return /** @type {any} */ (root.aran)[name];
  } else if (namespace === "global" || namespace === "linvail") {
    /** @type {any} */
    let current = root[namespace];
    for (let index = 1; index < parts.length; index++) {
      current = current?.[parts[index]];
    }
    return current;
  } else {
    throw new LinvailExecError("Invalid namespace in intrinsic name", {
      namespace,
      name,
      parts,
      root,
    });
  }
};

/**
 * @type {(
 *   region: import("./region.d.ts").Region,
 *   root: {
 *     global: typeof globalThis,
 *     aran: import("aran").ExtraIntrinsicRecord,
 *     linvail: import("../library/library.d.ts").Library,
 *   },
 * ) => void}
 */
export const registerOracleRecord = (region, root) => {
  for (const [name, { apply, construct }] of listEntry(oracle_record)) {
    if (apply !== null || construct !== null) {
      const intrinsic = fetchIntrinsic(root, name);
      if (isPrimitive(intrinsic)) {
        throw new LinvailExecError("Invalid intrinsic", {
          name,
          intrinsic,
          root,
        });
      }
      wrapFreshGuestReference(region, intrinsic, apply, construct);
    }
  }
};
