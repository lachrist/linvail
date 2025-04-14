import { aran_apply_oracle_mapping } from "./oracle/aran.mjs";
import {
  array_apply_oracle_mapping,
  array_construct_oracle_mapping,
} from "./oracle/array.mjs";
import {
  object_apply_oracle_mapping,
  object_construct_oracle_mapping,
} from "./oracle/object.mjs";
import {
  linvail_apply_oracle_mapping,
  linvail_construct_oracle_mapping,
} from "./oracle/linvail.mjs";
import { reflect_apply_oracle_mapping } from "./oracle/reflect.mjs";
import { LinvailExecError } from "../error.mjs";
import { listKey } from "../util/record.mjs";

const {
  Reflect: { apply },
  String: {
    prototype: { split },
  },
} = globalThis;

/**
 * @type {{
 *   [k in string]?: k extends "__proto__"
 *     ? null
 *     : null | import("./oracle.d.ts").ApplyOracle
 * }}
 */
export const apply_oracle_mapping = {
  __proto__: null,
  ...aran_apply_oracle_mapping,
  ...linvail_apply_oracle_mapping,
  ...reflect_apply_oracle_mapping,
  ...array_apply_oracle_mapping,
  ...object_apply_oracle_mapping,
};

/**
 * @type {{
 *   [k in string]?: k extends "__proto__"
 *     ? null
 *     : null | import("./oracle.d.ts").ConstructOracle
 * }}
 */
export const construct_oracle_mapping = {
  __proto__: null,
  ...array_construct_oracle_mapping,
  ...object_construct_oracle_mapping,
  ...linvail_construct_oracle_mapping,
};

const DOT = ["."];

/**
 * @type {(
 *   region: import("./region.d.ts").Region,
 *   root: {
 *     global: typeof globalThis,
 *     aran: import("aran").ExtraIntrinsicRecord,
 *     linvail: import("../linvail.d.ts").Library,
 *   },
 *   name: string,
 * ) => import("./domain.d.ts").Value}
 */
const fetchIntrinsic = (region, root, name) => {
  const { "global.Reflect.get": get } = region;
  /** @type {string[]} */
  const parts = apply(split, name, DOT);
  if (parts.length === 0) {
    throw new LinvailExecError("Empty intrinsic name", { name, root });
  }
  const namespace = parts[0];
  if (namespace === "aran") {
    /** @type {import("./domain.d.ts").GuestReference} */
    const aran = /** @type {any} */ (root.aran);
    return get(aran, name, aran);
  } else if (namespace === "global" || namespace === "linvail") {
    /** @type {import("./domain.d.ts").Value} */
    let current = /** @type {any} */ (root[namespace]);
    for (let index = 1; index < parts.length; index++) {
      current = get(current, parts[index], current);
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
export const fillOracleName = (region, root) => {
  const { naming } = region;
  for (const name of listKey(apply_oracle_mapping)) {
    if (apply_oracle_mapping[name]) {
      naming.$set(fetchIntrinsic(region, root, name), name);
    }
  }
  for (const name of listKey(construct_oracle_mapping)) {
    if (construct_oracle_mapping[name]) {
      naming.$set(fetchIntrinsic(region, root, name), name);
    }
  }
};
