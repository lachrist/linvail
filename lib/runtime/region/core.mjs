/* eslint-disable no-use-before-define */

import {
  addWeakSet,
  forEachSet,
  getWeakMap,
  hasWeakMap,
  hasWeakSet,
  setWeakMap,
} from "../../util/collection.mjs";
import { LinvailExecError } from "../../error.mjs";
import { createGuestExternalReference } from "./proxy.mjs";

///////////////
// Primitive //
///////////////

/**
 * @type {(
 *   region: import("./region").Region,
 *   value: import("../domain").InternalValue,
 * ) => value is import("../domain").InternalPrimitive}
 */
export const isInternalPrimitive = ({ internal_primitive_registery }, value) =>
  hasWeakSet(internal_primitive_registery, value);

/**
 * @type {(
 *   region: import("./region").Region,
 *   primitive: import("../domain").ExternalPrimitive,
 * ) => import("../domain").InternalPrimitive}
 */
export const enterPrimitive = (region, external) => {
  const {
    counter,
    "listening": listeners,
    "listening": { capture, active },
    internal_primitive_registery,
    "global.undefined": undefined,
    "global.Reflect.apply": apply,
  } = region;
  /** @type {import("../domain").InternalPrimitive} */
  const internal = /** @type {any} */ (
    counter
      ? { __inner: external, __index: counter.value++ }
      : { __inner: external }
  );
  addWeakSet(internal_primitive_registery, internal);
  if (capture && active) {
    listeners.active = false;
    try {
      forEachSet(
        capture,
        (listener) => {
          if (isGuestInternalReference(region, listener)) {
            apply(leavePlainExternalReference(region, listener), undefined, [
              external,
            ]);
          } else {
            apply(listener, enterPrimitive(region, undefined), [internal]);
          }
        },
        null,
      );
    } finally {
      listeners.active = true;
    }
  }
  return internal;
};

/**
 * @type {(
 *   region: import("./region").Region,
 *   primitive: import("../domain").InternalPrimitive,
 * ) => import("../domain").ExternalPrimitive}
 */
export const leavePrimitive = (region, internal) => {
  const {
    "listening": listeners,
    "listening": { release, active },
    "global.undefined": undefined,
    "global.Reflect.apply": apply,
  } = region;
  /** @type {import("../domain").ExternalPrimitive} */
  const external = /** @type {any} */ (internal).__inner;
  if (release && active) {
    listeners.active = false;
    try {
      forEachSet(
        release,
        (listener) => {
          if (isGuestInternalReference(region, listener)) {
            apply(leavePlainExternalReference(region, listener), undefined, [
              external,
            ]);
          } else {
            apply(listener, enterPrimitive(region, undefined), [internal]);
          }
        },
        null,
      );
    } finally {
      listeners.active = true;
    }
  }
  return external;
};

///////////////////////
// InternalReference //
///////////////////////

/**
 * @type {(
 *   region: import("./region").Region,
 *   reference: import("../domain").InternalReference,
 * ) => reference is import("../domain").GuestInternalReference}
 */
export const isGuestInternalReference = (
  { guest_internal_reference_registery },
  reference,
) => hasWeakSet(guest_internal_reference_registery, reference);

/**
 * @type {(
 *   region: import("./region").Region,
 *   reference: import("../domain").GuestInternalReference,
 * ) => import("../domain").PlainExternalReference}
 */
export const leavePlainExternalReference = (_, guest) =>
  /** @type {any} */ (guest);

/**
 * @type {(
 *   region: import("./region").Region,
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

/**
 * @type {(
 *   region: import("../region/region").Region,
 *   array: import("../domain").PlainInternalArrayWithExternalPrototype,
 *   prototype: import("../domain").InternalPrototype,
 * ) => import("../domain").PlainInternalArray}
 */
export const enterPlainInternalArrayWithExternalPrototype = (
  region,
  array,
  prototype,
) => {
  const {
    "global.Reflect.setPrototypeOf": setPrototypeOf,
    "global.TypeError": TypeError,
  } = region;
  if (!setPrototypeOf(array, prototype)) {
    throw new TypeError(
      "Cannot set internalize prototype of plain internal array",
    );
  }
  return /** @type {any} */ (array);
};

///////////////////////
// ExternalReference //
///////////////////////

/**
 * @type {(
 *   region: import("./region").Region,
 *   reference: import("../domain").ExternalReference,
 * ) => reference is import("../domain").GuestExternalReference}
 */
export const isGuestExternalReference = (
  { guest_external_reference_mapping },
  reference,
) => hasWeakMap(guest_external_reference_mapping, reference);

/**
 * @type {(
 *   region: import("./region").Region,
 *   reference: import("../domain").GuestExternalReference,
 * ) => import("../domain").PlainInternalReference}
 */
export const enterPlainInternalReference = (
  { guest_external_reference_mapping },
  reference,
) => {
  const plain = getWeakMap(guest_external_reference_mapping, reference);
  /* c8 ignore start */
  if (!plain) {
    throw new LinvailExecError("Invalid external reference", {
      guest_external_reference_mapping,
      reference,
    });
  }
  /* c8 ignore stop */
  return plain;
};

/**
 * @type {(
 *   region: import("./region").Region,
 *   plain: import("../domain").PlainInternalReference,
 * ) => import("../domain").GuestExternalReference}
 */
export const leavePlainInternalReference = (region, plain) => {
  const { guest_external_reference_mapping, plain_internal_reference_mapping } =
    region;
  const guest = getWeakMap(plain_internal_reference_mapping, plain);
  if (guest) {
    return guest;
  } else {
    const guest = createGuestExternalReference(region, plain);
    setWeakMap(guest_external_reference_mapping, guest, plain);
    setWeakMap(plain_internal_reference_mapping, plain, guest);
    return guest;
  }
};
