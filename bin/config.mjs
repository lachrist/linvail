import { makeRe } from "minimatch";

const {
  Error,
  Object: { hasOwn, getOwnPropertyNames },
} = globalThis;

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
 *   config: import("./config").Config,
 * ) => string[]}
 */
export const listConfigWarning = ({
  global,
  selection,
  instrument_global_dynamic_code,
}) => {
  /** @type {string[]} */
  const warnings = [];
  if (global === "internal") {
    if (selection !== null) {
      warnings.push(
        "Internalizing the global object (and the global declarative record) requires to instrument every single files, " +
          "thus selecting them is unsafe and both LINVAIL_INCLUDE and LINVAIL_EXCLUDE should be left empty.",
      );
    }
    if (!instrument_global_dynamic_code) {
      warnings.push(
        "Internalizing the global object (and the global declarative record) requires to instrument global dynamic code.",
      );
    }
  }
  return warnings;
};

const default_config = {
  LINVAIL_INSTRUMENT_GLOBAL_DYNAMIC_CODE: "1",
  LINVAIL_GLOBAL: "external",
  LINVAIL_INCLUDE: "**/*",
  LINVAIL_EXCLUDE: "",
};

/**
 * @type {(
 *   env: {[k in string]?: string},
 * ) => import("./config").Config}
 */
export const toConfig = (env) => {
  for (const key of getOwnPropertyNames(env)) {
    if (key.startsWith("LINVAIL_") && !hasOwn(default_config, key)) {
      throw new Error(`Unknown linvail configuration key: ${key}`);
    }
  }
  const config = {
    ...default_config,
    ...env,
  };
  const inclusions = compileGlobRegExpArray(config.LINVAIL_INCLUDE);
  const exclusions = compileGlobRegExpArray(config.LINVAIL_EXCLUDE);
  return {
    instrument_global_dynamic_code: getBoolean(
      config.LINVAIL_INSTRUMENT_GLOBAL_DYNAMIC_CODE,
      "LINVAIL_INSTRUMENT_GLOBAL_DYNAMIC_CODE",
    ),
    global: getEnumeration(
      config.LINVAIL_GLOBAL,
      regions,
      "LINVAIL_GLOBAL_OBJECT",
    ),
    selection:
      config.LINVAIL_INCLUDE === "**/*" && config.LINVAIL_EXCLUDE === ""
        ? null
        : (specifier) => {
            const normal = specifier.startsWith("./")
              ? specifier.slice(2)
              : specifier;
            for (const inclusion of inclusions) {
              if (inclusion.test(normal)) {
                for (const exclusion of exclusions) {
                  if (exclusion.test(normal)) {
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
