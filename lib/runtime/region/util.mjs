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
 *   region: import("./region").Region,
 *   reference: import("../domain").ExternalReference,
 * ) => import("../domain").InternalReference}
 */
export const enterReference = (region, reference) =>
  isGuestExternalReference(region, reference)
    ? enterPlainInternalReference(region, reference)
    : enterPlainExternalReference(region, reference);

/**
 * @type {(
 *   region: import("./region").Region,
 *   reference: import("../domain").InternalReference,
 * ) => import("../domain").ExternalReference}
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
 *   region: import("./region").Region,
 *   value: import("../domain").ExternalValue,
 * ) => import("../domain").InternalValue}
 */
export const enterValue = (region, value) =>
  isPrimitive(value)
    ? enterPrimitive(region, value)
    : enterReference(region, value);

/**
 * @type {(
 *   region: import("./region").Region,
 *   value: import("../domain").InternalValue,
 * ) => import("../domain").ExternalValue}
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
 *   region: import("./region").Region,
 *   prototype: import("../domain").ExternalPrototype,
 * ) => import("../domain").InternalPrototype}
 */
export const enterPrototype = (region, prototype) =>
  prototype ? enterReference(region, prototype) : prototype;

/**
 * @type {(
 *   region: import("./region").Region,
 *   prototype: import("../domain").InternalPrototype,
 * ) => import("../domain").ExternalPrototype}
 */
export const leavePrototype = (region, prototype) =>
  prototype ? leaveReference(region, prototype) : prototype;

//////////////
// Accessor //
//////////////

/**
 * @type {(
 *   region: import("./region").Region,
 *   accessor: import("../domain").ExternalAccessor,
 * ) => import("../domain").InternalAccessor}
 */
export const enterAccessor = (region, accessor) =>
  accessor ? enterReference(region, accessor) : accessor;

/**
 * @type {(
 *   region: import("./region").Region,
 *   accessor: import("../domain").InternalAccessor,
 * ) => import("../domain").ExternalAccessor}
 */
export const leaveAccessor = (region, accessor) =>
  accessor ? leaveReference(region, accessor) : accessor;
