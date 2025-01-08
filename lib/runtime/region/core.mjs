import {
  addWeakSet,
  forEachSet,
  getWeakMap,
  hasWeakMap,
  hasWeakSet,
  setWeakMap,
} from "../../collection.mjs";
import { LinvailExecError } from "../../error.mjs";

const { undefined } = globalThis;

///////////////
// Primitive //
///////////////

/**
 * @type {(
 *   region: import(".").Region,
 *   value: import("../domain").InternalValue,
 * ) => value is import("../domain").InternalPrimitive}
 */
export const isInternalPrimitive = ({ internal_primitive_registery }, value) =>
  hasWeakSet(internal_primitive_registery, value);

/**
 * @type {(
 *   region: import(".").Region,
 *   primitive: import("../domain").ExternalPrimitive,
 * ) => import("../domain").InternalPrimitive}
 */
export const enterPrimitive = (
  { listeners, internal_primitive_registery },
  external,
) => {
  /** @type {import("../domain").InternalPrimitive} */
  const internal = /** @type {any} */ ({ __inner: external });
  addWeakSet(internal_primitive_registery, internal);
  const { capture, active } = listeners;
  if (capture && active) {
    listeners.active = false;
    try {
      forEachSet(capture, (listener) => listener(internal), undefined);
    } finally {
      listeners.active = true;
    }
  }
  return internal;
};

/**
 * @type {(
 *   region: import(".").Region,
 *   primitive: import("../domain").InternalPrimitive,
 * ) => import("../domain").ExternalPrimitive}
 */
export const leavePrimitive = ({ listeners }, internal) => {
  const { release, active } = listeners;
  if (release && active) {
    listeners.active = false;
    try {
      forEachSet(release, (listener) => listener(internal), undefined);
    } finally {
      listeners.active = true;
    }
  }
  return /** @type {any} */ (internal).__inner;
};

///////////////////////
// InternalReference //
///////////////////////

/**
 * @type {(
 *   region: import(".").Region,
 *   reference: import("../domain").InternalReference,
 * ) => reference is import("../domain").GuestInternalReference}
 */
export const isGuestInternalReference = (
  { guest_internal_reference_registery },
  reference,
) => hasWeakSet(guest_internal_reference_registery, reference);

/**
 * @type {(
 *   region: import(".").Region,
 *   reference: import("../domain").GuestInternalReference,
 * ) => import("../domain").PlainExternalReference}
 */
export const leavePlainExternalReference = (_, guest) =>
  /** @type {any} */ (guest);

/**
 * @type {(
 *   region: import(".").Region,
 *   reference: import("../domain").PlainExternalReference,
 * ) => import("../domain").GuestInternalReference}
 */
export const enterPlainExternalReference = (
  { guest_internal_reference_registery },
  plain,
) => {
  addWeakSet(guest_internal_reference_registery, /** @type {any} */ (plain));
  return /** @type {any} */ (plain);
};

///////////////////////
// ExternalReference //
///////////////////////

/**
 * @type {(
 *   region: import(".").Region,
 *   reference: import("../domain").ExternalReference,
 * ) => reference is import("../domain").GuestExternalReference}
 */
export const isGuestExternalReference = (
  { guest_external_reference_mapping },
  reference,
) => hasWeakMap(guest_external_reference_mapping, reference);

/**
 * @type {(
 *   region: import(".").Region,
 *   reference: import("../domain").GuestExternalReference,
 * ) => import("../domain").PlainInternalReference}
 */
export const enterPlainInternalReference = (
  { guest_external_reference_mapping },
  reference,
) => {
  const plain = getWeakMap(guest_external_reference_mapping, reference);
  if (plain) {
    return plain;
  } else {
    throw new LinvailExecError("Invalid external reference", {
      guest_external_reference_mapping,
      reference,
    });
  }
};

/**
 * @type {(
 *   region: import(".").Region,
 *   reference: import("../domain").PlainInternalReference,
 * ) => import("../domain").GuestExternalReference}
 */
export const leavePlainInternalReference = (
  {
    global: { Proxy },
    guest_external_reference_mapping,
    plain_internal_reference_mapping,
    guest_external_reference_handler,
  },
  plain,
) => {
  const guest = getWeakMap(plain_internal_reference_mapping, plain);
  if (guest) {
    return guest;
  } else {
    const guest = new Proxy(plain, guest_external_reference_handler);
    setWeakMap(guest_external_reference_mapping, guest, plain);
    setWeakMap(plain_internal_reference_mapping, plain, guest);
    return guest;
  }
};
