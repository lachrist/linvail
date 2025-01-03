import {
  addWeakSet,
  getWeakMap,
  hasWeakMap,
  hasWeakSet,
  setWeakMap,
} from "../collection.mjs";
import { isPrimitive } from "../util.mjs";
import { compileProxyHandler } from "./proxy.mjs";

const { undefined, Error, Proxy, WeakSet, WeakMap } = globalThis;

/**
 * @type {(
 *   emission: import("./library").Emission,
 * ) => import("./region").PrimitiveRegion}
 */
const createPrimitiveRegion = ({ emitCapture, emitRelease }) => {
  /** @type {WeakSet<import("./domain").InternalPrimitive>} */
  const registery = new WeakSet();
  /**
   * @type {(
   *   value: import("./domain").InternalValue,
   * ) => value is import("./domain").InternalPrimitive}
   */
  const isInternalPrimitive = (value) => hasWeakSet(registery, value);
  return {
    isInternalPrimitive,
    enterPrimitive: (external) => {
      const internal = /** @type {import("./domain").InternalPrimitive} */ (
        /** @type {unknown} */ ({
          __inner: external,
        })
      );
      addWeakSet(registery, internal);
      emitCapture(internal);
      return internal;
    },
    leavePrimitive: (internal) => {
      const external =
        /** @type {{__inner: import("./domain").ExternalPrimitive}} */ (
          /** @type {unknown} */
          (internal)
        ).__inner;
      emitRelease(internal);
      return external;
    },
  };
};

/**
 * @type {() => import("./region").ExternalReferenceRegion}
 */
const createExternalReferenceRegion = () => {
  /** @type {WeakSet<import("./domain").GuestInternalReference>} */
  const registery = new WeakSet();
  /**
   * @type {(
   *   reference: import("./domain").InternalReference,
   * ) => reference is import("./domain").GuestInternalReference}
   */
  const isGuestInternalReference = (reference) =>
    hasWeakSet(registery, reference);
  return {
    isGuestInternalReference,
    enterPlainExternalReference: (reference) => {
      const guest = /** @type {import("./domain").GuestInternalReference} */ (
        /** @type {unknown} */ (reference)
      );
      addWeakSet(registery, guest);
      return guest;
    },
    leavePlainExternalReference: (reference) =>
      /** @type {import("./domain").PlainExternalReference} */ (
        /** @type {unknown} */ (reference)
      ),
  };
};

/**
 * @type {(
 *   region: import("./region").CoreRegion,
 * ) => import("./region").UtilRegion}
 */
const createUtilRegion = ({
  isInternalPrimitive,
  enterPrimitive,
  leavePrimitive,
  isGuestExternalReference,
  enterPlainInternalReference,
  enterPlainExternalReference,
  isGuestInternalReference,
  leavePlainExternalReference,
  leavePlainInternalReference,
}) => {
  /**
   * @type {(
   *   reference: import("./domain").ExternalReference,
   * ) => import("./domain").InternalReference}
   */
  const enterReference = (reference) =>
    isGuestExternalReference(reference)
      ? enterPlainInternalReference(reference)
      : enterPlainExternalReference(reference);
  /**
   * @type {(
   *   reference: import("./domain").InternalReference,
   * ) => import("./domain").ExternalReference}
   */
  const leaveReference = (reference) =>
    isGuestInternalReference(reference)
      ? leavePlainExternalReference(reference)
      : leavePlainInternalReference(reference);
  return {
    enterReference,
    leaveReference,
    enterValue: (value) =>
      isPrimitive(value) ? enterPrimitive(value) : enterReference(value),
    leaveValue: (value) =>
      isInternalPrimitive(value)
        ? leavePrimitive(value)
        : leaveReference(value),
    enterPrototype: (prototype) =>
      prototype === null ? null : enterReference(prototype),
    leavePrototype: (prototype) =>
      prototype === null ? null : leaveReference(prototype),
    enterAccessor: (accessor) =>
      accessor === undefined ? undefined : enterReference(accessor),
    leaveAccessor: (accessor) =>
      accessor === undefined ? undefined : leaveReference(accessor),
  };
};

/**
 * @type {(
 *   global: import("./global").Global,
 *   emission: import("./library").Emission,
 * ) => import("./region").Region}
 */
export const createRegion = (global, emission) => {
  /**
   * @type {WeakMap<
   *   import("./domain").GuestExternalReference,
   *   import("./domain").PlainInternalReference
   * >}
   */
  const external_guest_mapping = new WeakMap();
  /**
   * @type {WeakMap<
   *   import("./domain").PlainInternalReference,
   *   import("./domain").GuestExternalReference
   * >}
   */
  const external_plain_mapping = new WeakMap();
  /**
   * @type {(
   *   reference: import("./domain").ExternalReference,
   * ) => reference is import("./domain").GuestExternalReference}
   */
  const isGuestExternalReference = (reference) =>
    hasWeakMap(external_guest_mapping, reference);
  /** @type {import("./region").CoreRegion} */
  const core_region = {
    ...createPrimitiveRegion(emission),
    ...createExternalReferenceRegion(),
    isGuestExternalReference,
    leavePlainInternalReference: (reference) => {
      const guest = getWeakMap(external_plain_mapping, reference);
      if (guest) {
        return guest;
      } else {
        const guest = /** @type {import("./domain").GuestExternalReference} */ (
          /** @type {unknown} */ (
            // eslint-disable-next-line no-use-before-define
            new Proxy(reference, /** @type {any} */ (handlers))
          )
        );
        setWeakMap(external_guest_mapping, guest, reference);
        setWeakMap(external_plain_mapping, reference, guest);
        return guest;
      }
    },
    enterPlainInternalReference: (reference) => {
      const plain = getWeakMap(external_guest_mapping, reference);
      if (plain) {
        return plain;
      } else {
        throw new Error("Not registered as a guest external reference");
      }
    },
  };
  const util_region = createUtilRegion(core_region);
  const region = { ...core_region, ...util_region };
  const handlers = compileProxyHandler(global, region);
  return region;
};
