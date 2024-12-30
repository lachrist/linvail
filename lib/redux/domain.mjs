const {
  Array: { isArray },
} = globalThis;

/**
 * @type {(
 *   reference: import("./domain").PlainInternalReference,
 * ) => reference is import("./domain").InternalArray}
 */
export const isInternalArray = /** @type {any} */ (isArray);

/**
 * @type {(
 *   reference: import("./domain").PlainInternalReference,
 * ) => reference is import("./domain").InternalFunction}
 */
export const isInternalFunction = (reference) =>
  typeof reference === "function";
