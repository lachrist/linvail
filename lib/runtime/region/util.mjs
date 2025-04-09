import { isPrimitive } from "../../util/primitive.mjs";
import {
  enterPlainExternalReference,
  enterPlainInternalReference,
  enterPrimitive,
  isGuestExternalReference,
  isGuestInternalReference,
  isInternalPrimitive,
  leavePlainExternalReference,
  leavePlainInternalReference,
  leavePrimitive,
} from "./core.mjs";

///////////////
// Reference //
///////////////

/**
 * @type {(
 *   region: import("./region.d.ts").Region,
 *   reference: import("../domain.d.ts").ExternalReference,
 * ) => import("../domain.d.ts").InternalReference}
 */
export const enterReference = (region, reference) =>
  isGuestExternalReference(region, reference)
    ? enterPlainInternalReference(region, reference)
    : enterPlainExternalReference(region, reference);

/**
 * @type {(
 *   region: import("./region.d.ts").Region,
 *   reference: import("../domain.d.ts").InternalReference,
 * ) => import("../domain.d.ts").ExternalReference}
 */
export const leaveReference = (region, reference) =>
  isGuestInternalReference(region, reference)
    ? leavePlainExternalReference(region, reference)
    : leavePlainInternalReference(region, reference);

///////////
// Value //
///////////

/**
 * @type {(
 *   region: import("./region.d.ts").Region,
 *   value: import("../domain.d.ts").ExternalValue,
 * ) => import("../domain.d.ts").InternalValue}
 */
export const enterValue = (region, value) =>
  isPrimitive(value)
    ? enterPrimitive(region, value)
    : enterReference(region, value);

/**
 * @type {(
 *   region: import("./region.d.ts").Region,
 *   value: import("../domain.d.ts").InternalValue,
 * ) => import("../domain.d.ts").ExternalValue}
 */
export const leaveValue = (region, value) =>
  isInternalPrimitive(region, value)
    ? leavePrimitive(region, value)
    : leaveReference(region, value);

///////////////
// Prototype //
///////////////

/**
 * @type {(
 *   region: import("./region.d.ts").Region,
 *   prototype: import("../domain.d.ts").ExternalPrototype,
 * ) => import("../domain.d.ts").InternalPrototype}
 */
export const enterPrototype = (region, prototype) =>
  prototype ? enterReference(region, prototype) : prototype;

/**
 * @type {(
 *   region: import("./region.d.ts").Region,
 *   prototype: import("../domain.d.ts").InternalPrototype,
 * ) => import("../domain.d.ts").ExternalPrototype}
 */
export const leavePrototype = (region, prototype) =>
  prototype ? leaveReference(region, prototype) : prototype;

//////////////
// Accessor //
//////////////

/**
 * @type {(
 *   region: import("./region.d.ts").Region,
 *   accessor: import("../domain.d.ts").ExternalAccessor,
 * ) => import("../domain.d.ts").InternalAccessor}
 */
export const enterAccessor = (region, accessor) =>
  accessor ? enterReference(region, accessor) : accessor;

/**
 * @type {(
 *   region: import("./region.d.ts").Region,
 *   accessor: import("../domain.d.ts").InternalAccessor,
 * ) => import("../domain.d.ts").ExternalAccessor}
 */
export const leaveAccessor = (region, accessor) =>
  accessor ? leaveReference(region, accessor) : accessor;
