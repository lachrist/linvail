/**
 * @type {<R>(
 *   value: R | import("./primitive.d.ts").Primitive,
 * ) => value is import("./primitive.d.ts").Primitive}
 */

export const isPrimitive = (value) =>
  value === null || (typeof value !== "object" && typeof value !== "function");
