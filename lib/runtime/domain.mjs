import { LinvailTypeError } from "../error.mjs";

const {
  Object: { hasOwn },
  Array: { isArray },
} = globalThis;

/**
 * @type {(
 *   key: PropertyKey,
 * ) => key is import("./domain.d.ts").NonLengthPropertyKey}
 */
export const isNonLengthPropertyKey = (key) => key !== "length";

/**
 * @type {<V>(
 *   descriptor: import("./domain.d.ts").Descriptor<V>,
 * ) => descriptor is import("./domain.d.ts").DataDescriptor<V>}
 */
export const isDataDescriptor = (descriptor) => hasOwn(descriptor, "value");

/**
 * @type {(
 *   reference: import("./domain.d.ts").GuestReference,
 * ) => reference is import("./domain.d.ts").GuestReference<"function">}
 */
export const isFunctionGuestReference = (reference) =>
  typeof reference === "function";

/**
 * @type {<V>(
 *   descriptor: import("./domain.d.ts").Descriptor<V>,
 * ) => descriptor is import("./domain.d.ts").AccessorDescriptor}
 */
export const isAccessorDescriptor = (descriptor) =>
  !hasOwn(descriptor, "value");

/**
 * @type {<K extends import("./domain.d.ts").GuestReferenceKind>(
 *   reference: import("./domain.d.ts").GuestReference<K>,
 * ) => K}
 */
export const getGuestReferenceKind = (reference) => {
  switch (typeof reference) {
    case "object": {
      return /** @type {any} */ (isArray(reference) ? "array" : "object");
    }
    case "function": {
      return /** @type {any} */ ("function");
    }
    default: {
      throw new LinvailTypeError(reference);
    }
  }
};

/**
 * @type {(
 *   value: import("./domain.d.ts").Value,
 * ) => value is import("./domain.d.ts").StandardPrimitive}
 */
export const isStandardPrimitive = (value) => {
  if (value == null) {
    return true;
  } else {
    const type = typeof value;
    return (
      type === "boolean" ||
      type === "number" ||
      type === "string" ||
      type === "bigint"
    );
  }
};

/**
 * @type {(
 *   value: unknown,
 * ) => value is import("./domain.d.ts").Primitive}
 */
export const isPrimitive = (value) => {
  if (value == null) {
    return true;
  } else {
    const type = typeof value;
    return (
      type === "boolean" ||
      type === "number" ||
      type === "string" ||
      type === "bigint" ||
      type === "symbol"
    );
  }
};
