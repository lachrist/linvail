/**
 * @type {<R>(
 *   value: R | import("./primitive").Primitive,
 * ) => value is import("./primitive").Primitive}
 */

export const isPrimitive = (value) =>
  value === null || (typeof value !== "object" && typeof value !== "function");
