import { aran_apply_oracle_mapping } from "./oracle/aran.mjs";
import { array_apply_oracle_mapping } from "./oracle/array.mjs";
import { object_apply_oracle_mapping } from "./oracle/object.mjs";
import { reflect_apply_oracle_mapping } from "./oracle/reflect.mjs";

/**
 * @type {import("./oracle").ApplyOracleMapping}
 */
export const apply_oracle_mapping = {
  __proto__: null,
  ...aran_apply_oracle_mapping,
  ...reflect_apply_oracle_mapping,
  ...array_apply_oracle_mapping,
  ...object_apply_oracle_mapping,
};

/**
 * @type {import("./oracle").ConstructOracleMapping}
 */
export const construct_oracle_mapping = {
  __proto__: null,
};
