const {
  Array: { isArray },
  Object: { hasOwn },
} = globalThis;

/**
 * @type {(
 *   reference: import("./domain.d.ts").PlainInternalReference,
 * ) => reference is import("./domain.d.ts").PlainInternalArray}
 */
export const isPlainInternalArray = /** @type {any} */ (isArray);

export const isPlainInternalClosure = /**
 * @type {(
 *   reference: import("./domain.d.ts").PlainInternalReference,
 * ) => reference is import("./domain.d.ts").PlainInternalClosure}
 */ ((value) => typeof value === "function");

/**
 * @type {(
 *   key: PropertyKey,
 * ) => key is import("./domain.d.ts").NonLengthPropertyKey}
 */
export const isNonLengthPropertyKey = (key) => key !== "length";

/**
 * @type {<V, A>(
 *   descriptor: import("./domain.d.ts").Descriptor<V, A>,
 * ) => descriptor is import("./domain.d.ts").DataDescriptor<V>}
 */
export const isDataDescriptor = (descriptor) => hasOwn(descriptor, "value");

/**
 * @type {<V, A>(
 *   descriptor: import("./domain.d.ts").Descriptor<V, A>,
 * ) => descriptor is import("./domain.d.ts").AccessorDescriptor<A>}
 */
export const isAccessorDescriptor = (descriptor) =>
  !hasOwn(descriptor, "value");
