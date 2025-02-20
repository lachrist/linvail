import { inspect } from "node:util";
import { writeSync } from "node:fs";

export { inspect };

/**
 * @type {(
 *   value: unknown,
 * ) => void}
 */
export const dir = (value) => {
  writeSync(1, inspect(value, { showHidden: true, showProxy: true }) + "\n");
};

/**
 * @type {(
 *   message: string,
 * ) => void}
 */
export const log = (message) => {
  writeSync(1, message + "\n");
};
