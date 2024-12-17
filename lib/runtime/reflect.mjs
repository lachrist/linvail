import { hasOwnNarrow } from "../util.mjs";

/**
 * @type {<X>(
 *   descriptor: import("./reflect").Descriptor<X>,
 * ) => descriptor is import("./reflect").DataDescriptor<X>}
 */
export const isDataDescriptor = (descriptor) =>
  hasOwnNarrow(descriptor, "value");

/**
 * @type {<X>(
 *   value: import("./reflect").Value<X>,
 * ) => value is import("./reflect").Primitive}
 */
export const isPrimitive = (value) =>
  value === null || (typeof value !== "object" && typeof value !== "function");
