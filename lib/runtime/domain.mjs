const {
  Array: { isArray },
  Object: { hasOwn },
} = globalThis;

/**
 * @type {(
 *   reference: import("./domain").PlainInternalReference,
 * ) => reference is import("./domain").PlainInternalArray}
 */
export const isInternalArray = /** @type {any} */ (isArray);

export const isPlainInternalClosure = /**
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
