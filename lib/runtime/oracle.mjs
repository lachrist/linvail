import { aran_oracle_record } from "./oracle/aran.mjs";
import { array_oracle_record } from "./oracle/array.mjs";
import { object_oracle_record } from "./oracle/object.mjs";
import { linvail_oracle_record } from "./oracle/linvail.mjs";
import { reflect_oracle_record } from "./oracle/reflect.mjs";
import { listKey } from "../util/record.mjs";
import { wrapFreshGuestReference } from "./region/core.mjs";

const {
  Object: { hasOwn },
  Reflect: { apply },
  RegExp: {
    prototype: { exec },
  },
  String: {
    prototype: { split, startsWith },
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

const ARAN_PREFIX = ["aran."];

const LINVAIL_REGEXP = /$linvail\.(.)*^/u;

const GLOBAL_PREFIX = ["global."];

/**
 * @type {(
 *   value: unknown,
 * ) => value is import("./domain.d.ts").GuestReference}
 */
const isGuestReference = (value) =>
  value != null && (typeof value === "object" || typeof value === "function");

/**
 * @type {(
 *   path: string[],
 *   index: number,
 *   current: unknown,
 * ) => null | import("./domain.d.ts").GuestReference}
 */
const fetch = (path, index, current) => {
  if (
    current == null ||
    (typeof current !== "object" && typeof current !== "function")
  ) {
    return null;
  }
  if (index >= path.length) {
    return /** @type {import("./domain.d.ts").GuestReference} */ (current);
  }
  const segment = path[index];
  if (!hasOwn(current, segment)) {
    return null;
  }
  return fetch(path, index + 1, /** @type {any} */ (current)[segment]);
};

/**
 * @type {(
 *   region: import("./region.d.ts").Region,
 *   root: typeof globalThis,
 * ) => string[]}
 */
export const registerOracleGlobal = (region, root) => {
  /** @type {string[]} */
  const missing = [];
  for (const key of listKey(oracle_record)) {
    if (apply(startsWith, key, GLOBAL_PREFIX)) {
      const path = apply(split, key, DOT);
      const maybe = fetch(path, 1, root);
      if (maybe) {
        wrapFreshGuestReference(region, maybe, key);
      } else {
        missing[missing.length] = key;
      }
    }
  }
  return missing;
};

/**
 * @type {(
 *   region: import("./region.d.ts").Region,
 *   root: import("aran").ExtraIntrinsicRecord,
 * ) => string[]}
 */
export const registerOracleAran = (region, root) => {
  /** @type {string[]} */
  const missing = [];
  for (const key of listKey(oracle_record)) {
    if (apply(startsWith, key, ARAN_PREFIX)) {
      if (hasOwn(root, key)) {
        const value = /** @type {any} */ (root)[key];
        if (isGuestReference(value)) {
          wrapFreshGuestReference(region, value, key);
          continue;
        }
      }
      missing[missing.length] = key;
    }
  }
  return missing;
};

/**
 * @type {(
 *   region: import("./region.d.ts").Region,
 *   record: import("../library/library.d.ts").Library,
 * ) => string[]}
 */
export const registerOracleLinvail = (region, root) => {
  /** @type {string[]} */
  const missing = [];
  for (const key1 of listKey(oracle_record)) {
    const match = apply(exec, LINVAIL_REGEXP, [key1]);
    if (match) {
      const key2 = match[1];
      if (hasOwn(root, key2)) {
        const value = /** @type {any} */ (root)[key2];
        if (isGuestReference(value)) {
          wrapFreshGuestReference(region, value, key1);
          continue;
        }
      }
      missing[missing.length] = key1;
    }
  }
  return missing;
};
