const {
  Array: { isArray },
  String,
  Object: { hasOwn },
} = globalThis;

/**
 * @type {(
 *   reference: import("./domain").PlainInternalReference,
 * ) => reference is import("./domain").PlainInternalArray}
 */
export const isInternalArray = /** @type {any} */ (isArray);

export const isInternalClosure = /**
 * @type {(
 *   reference: import("./domain").PlainInternalReference,
 * ) => reference is import("./domain").PlainInternalClosure}
 */ ((value) => typeof value === "function");

/**
 * @type {(
 *   key: PropertyKey,
 * ) => key is import("./domain").NonLengthPropertyKey}
 */
export const isNonLengthPropertyKey = (key) => key !== "length";

/**
 * @type {(
 *   key: import("./domain").ExternalValue,
 * ) => PropertyKey}
 */
export const toPropertyKey = (value) =>
  typeof value === "symbol" ? value : String(value);

/**
 * @type {<V, A>(
 *   descriptor: import("./domain").Descriptor<V, A>,
 * ) => descriptor is import("./domain").DataDescriptor<V>}
 */
export const isDataDescriptor = (descriptor) => hasOwn(descriptor, "value");

/**
 * @type {<V, A>(
 *   descriptor: import("./domain").Descriptor<V, A>,
 * ) => descriptor is import("./domain").AccessorDescriptor<A>}
 */
export const isAccessorDescriptor = (descriptor) =>
  !hasOwn(descriptor, "value");
