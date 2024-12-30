import {
  addWeakSet,
  getWeakMap,
  hasWeakMap,
  hasWeakSet,
  setWeakMap,
} from "../collection.mjs";
import { compileProxyHandler } from "./proxy.mjs";

const { Error, Proxy, WeakSet, WeakMap } = globalThis;

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
    toInternalPrimitive: (external) => {
      const internal = /** @type {import("./domain").InternalPrimitive} */ (
        /** @type {unknown} */ ({
          __inner: external,
        })
      );
      addWeakSet(registery, internal);
      emitCapture(internal);
      return internal;
    },
    toExternalPrimitive: (internal) => {
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
    toGuestInternalReference: (reference) => {
      const guest = /** @type {import("./domain").GuestInternalReference} */ (
        /** @type {unknown} */ (reference)
      );
      addWeakSet(registery, guest);
      return guest;
    },
    toPlainExternalReference: (reference) =>
      /** @type {import("./domain").PlainExternalReference} */ (
        /** @type {unknown} */ (reference)
      ),
  };
};

/**
 * @type {(
 *   Reflect: typeof globalThis.Reflect,
 *   emission: import("./library").Emission,
 * ) => import("./region").Region}
 */
export const createRegion = (Reflect, emission) => {
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
  /** @type {import("./region").Region} */
  const region = {
    ...createPrimitiveRegion(emission),
    ...createExternalReferenceRegion(),
    isGuestExternalReference,
    toGuestExternalReference: (reference) => {
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
    toPlainInternalReference: (reference) => {
      const plain = getWeakMap(external_guest_mapping, reference);
      if (plain) {
        return plain;
      } else {
        throw new Error("Not registered as a guest external reference");
      }
    },
  };
  const handlers = compileProxyHandler(
    /** @type {import("./reflect").Reflect} */ (
      /** @type {unknown} */ (Reflect)
    ),
    region,
  );
  return region;
};
