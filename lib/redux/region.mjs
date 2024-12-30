import { isPrimitive } from "../util.mjs";

/**
 * @type {<X>(
 *   value: import("./domain").ExternalValue,
 *   region: import("./region").Region<X>,
 * ) => import("./domain").InternalValue<X>}
 */
export const enter = (
  value,
  {
    capture,
    isGuestExternalReference,
    toPlainInternalReference: infiltrateInternalReference,
    toGuestInternalReference: infiltrateExternalReference,
  },
) => {
  if (isPrimitive(value)) {
    return capture(value);
  } else if (isGuestExternalReference(value)) {
    return infiltrateInternalReference(value);
  } else {
    return infiltrateExternalReference(value);
  }
};

/**
 * @type {<X>(
 *   value: import("./domain").InternalValue<X>,
 *   region: import("./region").Region<X>,
 * ) => import("./domain").ExternalValue}
 */
export const leave = (
  value,
  {
    isHandle,
    release,
    isGuestInternalReference,
    toGuestExternalReference: exfiltrateInternalReference,
    toPlainExternalReference: exfiltrateExternalReference,
  },
) => {
  if (isHandle(value)) {
    return release(value);
  } else if (isGuestInternalReference(value)) {
    return exfiltrateExternalReference(value);
  } else {
    return exfiltrateInternalReference(value);
  }
};
