const {
  Reflect: { apply },
  String: {
    prototype: { split: splitString },
  },
} = globalThis;

/**
 * @type {(
 *   target: string,
 *   separator: string,
 * ) => string[]}
 */
export const split = (target, separator) =>
  apply(splitString, target, [separator]);
