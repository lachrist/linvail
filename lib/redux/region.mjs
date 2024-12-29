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
    isExtrinsicExternalReference,
    infiltrateInternalReference,
    infiltrateExternalReference,
  },
) => {
  if (isPrimitive(value)) {
    return capture(value);
  } else if (isExtrinsicExternalReference(value)) {
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
    isIntrinsicInternalReference,
    exfiltrateInternalReference,
    exfiltrateExternalReference,
  },
) => {
  if (isHandle(value)) {
    return release(value);
  } else if (isIntrinsicInternalReference(value)) {
    return exfiltrateInternalReference(value);
  } else {
    return exfiltrateExternalReference(value);
  }
};
