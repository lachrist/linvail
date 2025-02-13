/* eslint-disable local/no-method-call */

import { makeRe } from "minimatch";

const { Error } = globalThis;

/**
 * @type {(
 *   string: string,
 * ) => string}
 */
const trim = (string) => string.trim();

/**
 * @type {(
 *   glob: string,
 * ) => RegExp}
 */
const compileGlobRegExp = (glob) => {
  const regexp = makeRe(glob);
  if (!regexp) {
    throw new Error(`Invalid glob pattern: ${glob}`);
  }
  return regexp;
};

/**
 * @type {(
 *   globs: string,
 * ) => RegExp[]}
 */
const compileGlobRegExpArray = (globs) => {
  if (globs.trim() === "") {
    return [];
  } else {
    return globs.split(",").map(trim).map(compileGlobRegExp);
  }
};

/**
 * @type {(
 *   value: string,
 *   name: string,
 * ) => boolean}
 */
const getBoolean = (value, location) => {
  value = value.toLowerCase();
  if (value === "true" || value === "1" || value === "on" || value === "yes") {
    return true;
  }
  if (value === "false" || value === "0" || value === "off" || value === "no") {
    return false;
  }
  throw new Error(`Invalid boolean value for ${location}, got: ${value}`);
};

/**
 * @type {<X extends string>(
 *   value: string,
 *   valids: X[],
 *   name: string,
 * ) => X}
 */
const getEnumeration = (value, valids, location) => {
  for (const valid of valids) {
    if (valid.toLowerCase() === value.toLowerCase()) {
      return valid;
    }
  }
  throw new Error(`Invalid enum value for ${location}, got: ${value}`);
};

/**
 * @type {["internal", "external"]}
 */
const regions = ["internal", "external"];

/**
 * @type {(
 *   env: {[k in string]?: string},
 * ) => import("./config").Config}
 */
export const toConfig = (env) => {
  const config = {
    LINVAIL_INSTRUMENT_DYNAMIC_CODE: "1",
    LINVAIL_GLOBAL_DECLARATIVE_RECORD: "emulate",
    LINVAIL_INCLUDE: "**/*",
    LINVAIL_EXCLUDE: "",
    ...env,
  };
  const inclusions = compileGlobRegExpArray(config.LINVAIL_INCLUDE);
  const exclusions = compileGlobRegExpArray(config.LINVAIL_EXCLUDE);
  return {
    instrument_dynamic_code: getBoolean(
      config.LINVAIL_INSTRUMENT_DYNAMIC_CODE,
      "LINVAIL_INSTRUMENT_DYNAMIC_CODE",
    ),
    global_declarative_record: getEnumeration(
      config.LINVAIL_GLOBAL_DECLARATIVE_RECORD,
      regions,
      "LINVAIL_GLOBAL_DECLARATIVE_RECORD",
    ),
    global_object: getEnumeration(
      config.LINVAIL_GLOBAL_DECLARATIVE_RECORD,
      regions,
      "LINVAIL_GLOBAL_OBJECT",
    ),
    selection: (specifier) => {
      for (const inclusion of inclusions) {
        if (inclusion.test(specifier)) {
          for (const exclusion of exclusions) {
            if (exclusion.test(specifier)) {
              return false;
            }
          }
          return true;
        }
      }
      return false;
    },
  };
};
