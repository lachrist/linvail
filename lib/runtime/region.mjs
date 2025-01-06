import {
  addWeakSet,
  getWeakMap,
  hasWeakMap,
  hasWeakSet,
  setWeakMap,
} from "../collection.mjs";
import { isPrimitive } from "../util.mjs";
import { compileProxyHandler } from "./proxy.mjs";
import { LinvailTypeError } from "../error.mjs";

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
 *   region: (
 *     & import("./region").PrimitiveRegion
 *     & import("./region").ReferenceRegion
 *     & import("./region").UtilRegion
 *   ),
 * ) => import("./region").ClosureRegion}
 */
export const compileClosureRegion = (
  {
    undefined,
    Error,
    Reflect: {
      apply,
      getPrototypeOf,
      setPrototypeOf,
      getOwnPropertyDescriptor,
      defineProperty,
      deleteProperty,
    },
  },
  { enterPrototype, enterPrimitive, enterReference },
) => {
  /**
   * @type {WeakMap<
   *   import("./domain").PlainInternalClosure,
   *   import("../instrument").ClosureKind
   * >}
   */
  const registery = new WeakMap();
  return {
    enterPlainInternalClosure: (closure, kind) => {
      if (!setPrototypeOf(closure, enterPrototype(getPrototypeOf(closure)))) {
        throw new Error("Cannot internalize prototype of closure");
      }
      const prototype_descriptor = getOwnPropertyDescriptor(
        closure,
        "prototype",
      );
      if (prototype_descriptor) {
        if (
          !defineProperty(closure, "prototype", {
            ...prototype_descriptor,
            value: enterPrimitive(null),
          })
        ) {
          throw new Error("Cannot redefine prototype property of closure");
        }
      }
      if (!deleteProperty(closure, "length")) {
        throw new Error("Cannot delete length property of closure");
      }
      if (!deleteProperty(closure, "name")) {
        throw new Error("Cannot delete name property of closure");
      }
      /** @type {import("./domain").PlainInternalClosure} */
      const result = /** @type {any} */ (closure);
      setWeakMap(registery, result, kind);
      return result;
    },
    applyPlainInternalClosure: (target, that, args) => {
      const kind = getWeakMap(registery, target);
      if (kind === undefined) {
        throw new Error("Closure kind not found");
      } else {
        const result = apply(/** @type {any} */ (target), that, args);
        if (kind === "arrow" || kind === "method" || kind === "function") {
          return result;
        } else if (
          kind === "arrow.async" ||
          kind === "method.async" ||
          kind === "function.async" ||
          kind === "generator" ||
          kind === "generator.async"
        ) {
          return enterReference(result);
        } else {
          throw new LinvailTypeError(kind);
        }
      }
    },
  };
};

/**
 * @type {(
 *   region: (
 *     & import("./region").PrimitiveRegion
 *     & import("./region").ReferenceRegion
 *   ),
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
  /** @type {import("./region").PrimitiveRegion} */
  const primitive_region = createPrimitiveRegion(emission);
  /** @type {import("./region").ReferenceRegion} */
  const reference_region = {
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
  const util_region = createUtilRegion({
    ...primitive_region,
    ...reference_region,
  });
  const closure_region = compileClosureRegion(global, {
    ...primitive_region,
    ...reference_region,
    ...util_region,
  });
  /** @type {import("./region").Region} */
  const region = {
    ...primitive_region,
    ...reference_region,
    ...util_region,
    ...closure_region,
  };
  const handlers = compileProxyHandler(global, region);
  return region;
};
