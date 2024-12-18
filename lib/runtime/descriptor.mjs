const {
  Object: { hasOwn },
} = globalThis;

/**
 * @type {<X>(
 *   descriptor: import("./descriptor").Descriptor<X>,
 * ) => descriptor is import("./descriptor").DataDescriptor<X>}
 */
export const isDataDescriptor = (descriptor) => hasOwn(descriptor, "value");

/**
 * @type {<X>(
 *   descriptor: import("./descriptor").Descriptor<X>,
 * ) => descriptor is import("./descriptor").AccessorDescriptor<X>}
 */
export const isAccessorDescriptor = (descriptor) =>
  !hasOwn(descriptor, "value");
