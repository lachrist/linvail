import { compileCalling } from "./calling.mjs";
import { createLibrary } from "./library.mjs";
import { isPrimitive } from "../util.mjs";
import { extractAranLibrary } from "./aran.mjs";
import { createRegion } from "./region.mjs";

/**
 * @type {(
 *   global: typeof globalThis,
 *   region: import("./region").Region,
 * ) => (
 *   closure: Function,
 * ) => import("./domain").InternalReference}
 */
const compileSanitizeClosure =
  (
    {
      Object: { hasOwn },
      Reflect: { getPrototypeOf, setPrototypeOf, deleteProperty },
    },
    { toInternalPrimitive, toGuestInternalReference },
  ) =>
  (closure) => {
    if (hasOwn(closure, "prototype")) {
      closure.prototype = toInternalPrimitive(null);
    }
    deleteProperty(closure, "length");
    deleteProperty(closure, "name");
    setPrototypeOf(
      closure,
      toGuestInternalReference(
        /** @type {import("./domain").PlainExternalReference} */ (
          getPrototypeOf(closure)
        ),
      ),
    );
    return /** @type {any} */ (closure);
  };

/**
 * @type {(
 *   global: typeof globalThis,
 *   region: import("./region").Region,
 * ) => (
 *   values: import("./domain").InternalValue[],
 * ) => import("./domain").InternalReference}
 */
const compileSanitizeArray =
  (
    { Reflect: { getPrototypeOf, setPrototypeOf } },
    { toGuestInternalReference },
  ) =>
  (values) => {
    setPrototypeOf(
      values,
      toGuestInternalReference(
        /** @type {import("./domain").PlainExternalReference} */ (
          getPrototypeOf(values)
        ),
      ),
    );
    return /** @type {import("./domain").InternalReference} */ (
      /** @type {unknown} */ (values)
    );
  };

/**
 * @type {(
 *   region: import("./region").Region,
 * ) => (
 *   value: import("./domain").ExternalValue,
 * ) => import("./domain").InternalValue}
 */
const compileEnter =
  ({
    toInternalPrimitive,
    isGuestExternalReference,
    toPlainInternalReference,
    toGuestInternalReference,
  }) =>
  (value) =>
    isPrimitive(value)
      ? toInternalPrimitive(value)
      : isGuestExternalReference(value)
        ? toPlainInternalReference(value)
        : toGuestInternalReference(value);

/**
 * @type {(
 *   region: import("./region").Region,
 * ) => (
 *   value: import("./domain").InternalValue,
 * ) => import("./domain").ExternalValue}
 */
const compileLeave =
  ({
    isInternalPrimitive,
    toExternalPrimitive,
    isGuestInternalReference,
    toPlainExternalReference,
    toGuestExternalReference,
  }) =>
  (value) =>
    isInternalPrimitive(value)
      ? toExternalPrimitive(value)
      : isGuestInternalReference(value)
        ? toPlainExternalReference(value)
        : toGuestExternalReference(value);

/**
 * @type {(
 *   intrinsics: import("aran").AranIntrinsicRecord,
 * ) => {
 *   library: import("./library").Linvail,
 *   advice: import("../advice").Advice,
 * }}
 */
export const createRuntime = (intrinsics) => {
  const global = intrinsics["aran.global"];
  const { library, emission } = createLibrary(global);
  const region = createRegion(global.Reflect, emission);
  const { apply, construct } = compileCalling(
    region,
    global,
    extractAranLibrary(intrinsics),
    library,
  );
  return {
    library,
    advice: {
      enter: compileEnter(region),
      leave: compileLeave(region),
      sanitizeClosure: compileSanitizeClosure(global, region),
      sanitizeArray: compileSanitizeArray(global, region),
      apply,
      construct: (callee, args) => construct(callee, args, callee),
    },
  };
};
