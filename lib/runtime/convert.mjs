import { LinvailExecError } from "../error.mjs";
import {
  enterPlainExternalReference,
  enterPrimitive,
  isInternalPrimitive,
  leavePrimitive,
} from "./region/core.mjs";
import { enterPrototype, leaveValue } from "./region/util.mjs";

/**
 * @type {(
 *   region: import("./region").Region,
 *   array: import("./domain").PlainInternalArrayWithExternalPrototype,
 * ) => import("./domain").PlainInternalArray}
 */
export const fromPlainInternalArrayWithExternalPrototype = (region, array) => {
  const {
    global: {
      Reflect: { setPrototypeOf, getPrototypeOf },
    },
  } = region;
  if (!setPrototypeOf(array, enterPrototype(region, getPrototypeOf(array)))) {
    throw new LinvailExecError("Cannot internalize prototype of array", {
      array,
      region,
    });
  }
  return /** @type {any} */ (array);
};

/**
 * @type {(
 *   region: import("./region").Region,
 *   array: import("./domain").InternalValue[],
 *   index: number,
 * ) => import("./domain").InternalValue}
 */
export const atInternal = (region, array, index) =>
  index < array.length
    ? array[index]
    : enterPrimitive(region, region.global.undefined);

/**
 * @type {(
 *   region: import("./region").Region,
 *   array: import("./domain").InternalValue[],
 *   index: number,
 * ) => import("./domain").ExternalValue}
 */
export const atExternal = (region, array, index) =>
  index < array.length
    ? leaveValue(region, array[index])
    : region.global.undefined;

/**
 * @type {(
 *   region: import("./region").Region,
 *   value: import("./domain").InternalValue,
 * ) => import("./domain").InternalReference}
 */
export const toInternalReferenceSloppy = (region, value) => {
  if (isInternalPrimitive(region, value)) {
    const primitive = leavePrimitive(region, value);
    if (primitive == null) {
      const {
        global: { TypeError },
      } = region;
      throw new TypeError("Cannot convert nullish to reference");
    } else {
      const {
        global: {
          Object: { __self: toObject },
        },
      } = region;
      return enterPlainExternalReference(region, toObject(primitive));
    }
  } else {
    return value;
  }
};

/**
 * @type {(
 *   region: import("./region").Region,
 *   value: import("./domain").InternalValue,
 * ) => import("./domain").InternalReference}
 */
export const toInternalReferenceStrict = (region, value) => {
  if (isInternalPrimitive(region, value)) {
    const {
      global: { TypeError },
    } = region;
    throw new TypeError("Cannot convert primitive to reference");
  } else {
    return value;
  }
};
