const {
  Array: { isArray },
  Reflect: { apply },
  WeakSet: {
    prototype: { has },
  },
} = globalThis;

/**
 * @type {(
 *   reference: import("./domain").ExtrinsicInternalReference,
 * ) => import("./domain").IntrinsicExternalReference}
 */
export const exfiltrateExternalReference = (reference) =>
  /** @type {any} */ (reference);

/**
 * @type {(
 *   reference: import("./domain").IntrinsicExternalReference,
 * ) => import("./domain").ExtrinsicInternalReference}
 */
export const infiltrateExternalReference = (reference) =>
  /** @type {any} */ (reference);

/**
 * @type {<X>(
 *   reference: import("./domain").InternalReference<X>,
 *   registery: import("./domain").Registery<X>,
 * ) => reference is import("./domain").InternalReference<X>}
 */
export const isIntrinsicInternalReference = (reference, registery) =>
  apply(has, registery, [reference]);

/**
 * @type {<X>(
 *   reference: import("./domain").IntrinsicInternalReference<X>,
 * ) => reference is import("./domain").InternalArray<X>}
 */
export const isInternalArray = /** @type {any} */ (isArray);

/**
 * @type {<X>(
 *   reference: import("./domain").IntrinsicInternalReference<X>,
 * ) => reference is import("./domain").InternalFunction<X>}
 */
export const isInternalFunction = (reference) =>
  typeof reference === "function";
