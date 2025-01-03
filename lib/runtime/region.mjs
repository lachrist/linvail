import {
  addWeakSet,
  getWeakMap,
  hasWeakMap,
  hasWeakSet,
  setWeakMap,
} from "../collection.mjs";
import { isPrimitive, map } from "../util.mjs";
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
 *   global: import("./global").Global,
 *   region: import("./region").CoreRegion,
 * ) => import("./region").UtilRegion}
 */
const createUtilRegion = (
  { TypeError, Object, Reflect: { apply, getPrototypeOf, setPrototypeOf } },
  {
    isInternalPrimitive,
    enterPrimitive,
    leavePrimitive,
    isGuestExternalReference,
    enterPlainInternalReference,
    enterPlainExternalReference,
    isGuestInternalReference,
    leavePlainExternalReference,
    leavePlainInternalReference,
  },
) => {
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
  /**
   * @type {(
   *   value: import("./domain").ExternalValue,
   * ) => import("./domain").InternalValue}
   */
  const enterValue = (value) =>
    isPrimitive(value) ? enterPrimitive(value) : enterReference(value);
  /**
   * @type {(
   *   value: import("./domain").InternalValue,
   * ) => import("./domain").ExternalValue}
   */
  const leaveValue = (value) =>
    isInternalPrimitive(value) ? leavePrimitive(value) : leaveReference(value);
  /**
   * @type {(
   *   prototype: import("./domain").ExternalPrototype,
   * ) => import("./domain").InternalPrototype}
   */
  const enterPrototype = (prototype) =>
    prototype === null ? null : enterReference(prototype);
  /**
   * @type {(
   *   prototype: import("./domain").InternalPrototype,
   * ) => import("./domain").ExternalPrototype}
   */
  const leavePrototype = (prototype) =>
    prototype === null ? null : leaveReference(prototype);
  return {
    enterReference,
    leaveReference,
    enterValue,
    leaveValue,
    enterPrototype,
    leavePrototype,
    enterAccessor: (accessor) =>
      accessor === undefined ? undefined : enterReference(accessor),
    leaveAccessor: (accessor) =>
      accessor === undefined ? undefined : leaveReference(accessor),
    atInternal: (array, index) =>
      index > array.length ? enterPrimitive(undefined) : array[index],
    atExternal: (array, index) =>
      index > array.length ? undefined : leaveValue(array[index]),
    harmonizePrototype: (reference) => {
      if (
        setPrototypeOf(reference, enterPrototype(getPrototypeOf(reference)))
      ) {
        return reference;
      } else {
        throw new Error("Failed to harmonize prototype");
      }
    },
    toInternalReference: (value) => {
      if (isInternalPrimitive(value)) {
        const primitive = leavePrimitive(value);
        if (primitive == null) {
          throw new TypeError("Cannot convert undefined or null to object");
        } else {
          return enterPlainExternalReference(Object(primitive));
        }
      } else {
        return value;
      }
    },
    fromExternalPrototype: (prototype) =>
      prototype === null ? enterPrimitive(null) : enterReference(prototype),
    toExternalPrototype: (prototype) => {
      if (isPrimitive(prototype)) {
        if (prototype === null) {
          return null;
        } else if (prototype === undefined) {
          throw new TypeError("Cannot convert undefined to prototype");
        } else {
          return Object(prototype);
        }
      } else {
        return prototype;
      }
    },
    toInternalPrototype: (prototype) => {
      if (isInternalPrimitive(prototype)) {
        const primitive = leavePrimitive(prototype);
        if (primitive === null) {
          return null;
        } else if (primitive === undefined) {
          throw new TypeError("Cannot convert undefined to prototype");
        } else {
          return enterPlainExternalReference(Object(primitive));
        }
      } else {
        return prototype;
      }
    },
    fromInternalPrototype: (prototype) =>
      prototype === null ? enterPrimitive(null) : prototype,
    applyInternalInternal: (target, that, args) =>
      isGuestInternalReference(target)
        ? enterValue(
            apply(
              leavePlainExternalReference(target),
              leaveValue(that),
              map(args, leaveValue),
            ),
          )
        : apply(target, that, args),
    applyInternalExternal: (target, that, args) =>
      isGuestInternalReference(target)
        ? apply(leavePlainExternalReference(target), that, args)
        : leaveValue(apply(target, enterValue(that), map(args, enterValue))),
    applyExternalInternal: (target, that, args) =>
      isGuestExternalReference(target)
        ? apply(enterPlainInternalReference(target), that, args)
        : enterValue(apply(target, leaveValue(that), map(args, leaveValue))),
    applyExternalExternal: (target, that, args) =>
      isGuestExternalReference(target)
        ? leaveValue(
            apply(
              enterPlainInternalReference(target),
              enterValue(that),
              map(args, enterValue),
            ),
          )
        : apply(target, that, args),
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
  const util_region = createUtilRegion(global, core_region);
  const region = { ...core_region, ...util_region };
  const handlers = compileProxyHandler(global, region);
  return region;
};
