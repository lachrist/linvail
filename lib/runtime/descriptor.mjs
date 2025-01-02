const {
  Object: { hasOwn },
} = globalThis;

/**
 * @type {<V, A>(
 *   descriptor: import("./descriptor").Descriptor<V, A>,
 * ) => descriptor is import("./descriptor").DataDescriptor<V>}
 */
export const isDataDescriptor = (descriptor) => hasOwn(descriptor, "value");

/**
 * @type {<V, A>(
 *   descriptor: import("./descriptor").Descriptor<V, A>,
 * ) => descriptor is import("./descriptor").AccessorDescriptor<A>}
 */
export const isAccessorDescriptor = (descriptor) =>
  !hasOwn(descriptor, "value");
