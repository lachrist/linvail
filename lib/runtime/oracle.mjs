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
import { isPrimitive } from "../util/primitive.mjs";
import { isGuestExternalReference } from "./region/core.mjs";

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
 *     : null | import("./oracle").ApplyOracle
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
 *     : null | import("./oracle").ConstructOracle
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
 *   region: import("./region/region").Region,
 *   root: {
 *     global: typeof globalThis,
 *     aran: import("aran").ExtraIntrinsicRecord,
 *     linvail: import("./domain").ExternalReference,
 *   },
 *   name: string,
 * ) => import("./domain").ExternalValue}
 */
export const fetchIntrinsic = (region, root, name) => {
  const { "global.Reflect.get": get } = region;
  /** @type {string[]} */
  const parts = apply(split, name, DOT);
  if (parts.length === 0) {
    throw new LinvailExecError("Empty intrinsic name", { name, root });
  }
  const namespace = parts[0];
  if (namespace === "aran") {
    /** @type {import("./domain").PlainExternalReference} */
    const aran = /** @type {any} */ (root.aran);
    return get(aran, name, aran);
  } else if (namespace === "global" || namespace === "linvail") {
    /** @type {import("./domain").ExternalValue} */
    let current = /** @type {any} */ (root[namespace]);
    for (let index = 1; index < parts.length; index++) {
      if (isPrimitive(current)) {
        throw new LinvailExecError("Missing intrinsic at name", {
          name,
          parts,
          index,
          current,
          root,
        });
      }
      if (isGuestExternalReference(region, current)) {
        throw new LinvailExecError("Found guest intrinsic", {
          name,
          parts,
          index,
          current,
          root,
        });
      }
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
