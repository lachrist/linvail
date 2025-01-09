const { isNaN } = globalThis;

/**
 * @type {(
 *   main: number,
 *   recovery: number,
 * ) => number}
 */
export const resolveNaN = (main, recovery) => (isNaN(main) ? recovery : main);
