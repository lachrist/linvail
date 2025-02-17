const {
  isNaN,
  Number: { MAX_SAFE_INTEGER, MIN_SAFE_INTEGER },
  Math: { trunc },
} = globalThis;

/**
 * @type {(
 *   main: number,
 *   recovery: number,
 * ) => number}
 */
export const resolveNaN = (main, recovery) => (isNaN(main) ? recovery : main);

/**
 * @type {(
 *   target: number,
 *   min: number,
 *   max: number,
 * ) => number}
 */
export const clamp = (target, min, max) => {
  if (target < min) {
    return min;
  }
  if (target > max) {
    return max;
  }
  return target;
};

/**
 * @type {(
 *   target: number,
 *   fallback: number,
 * ) => number}
 */
export const toInteger = (target, fallback) => {
  if (isNaN(target)) {
    return fallback;
  }
  if (target < MIN_SAFE_INTEGER) {
    return MIN_SAFE_INTEGER;
  }
  if (target > MAX_SAFE_INTEGER) {
    return MAX_SAFE_INTEGER;
  }
  return trunc(target);
};

/**
 * @type {(
 *   target: number,
 *   increment: number,
 * ) => number}
 */
export const incrementWhenNegative = (target, increment) =>
  target < 0 ? target + increment : target;
