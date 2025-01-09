import { LinvailExecError } from "../error.mjs";
import { getInternal, hasInternal } from "./reflect.mjs";
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
  const {
    global: { TypeError },
  } = region;
  if (isInternalPrimitive(region, value)) {
    throw new TypeError("Cannot convert primitive to reference");
  } else {
    return value;
  }
};

/**
 * @type {(
 *   region: import("./region").Region,
 *   value: import("./domain").InternalValue,
 * ) => import("./domain").InternalPrototype}
 */
export const toInternalPrototype = (region, value) => {
  const {
    global: { TypeError },
  } = region;
  if (isInternalPrimitive(region, value)) {
    const primitive = leavePrimitive(region, value);
    if (primitive === null) {
      return null;
    } else {
      throw new TypeError("Cannot convert primitive to prototype");
    }
  } else {
    return value;
  }
};

/** @type {["get", "set"]} */
const accessors = ["get", "set"];

/** @type {["writable", "enumerable", "configurable"]} */
const flags = ["writable", "enumerable", "configurable"];

/**
 * @type {(
 *   region: import("./region").Region,
 *   value: import("./domain").InternalValue,
 * ) => import("./domain").InternalAccessor}
 */
export const toInternalAccessor = (region, value) => {
  const {
    global: { undefined, TypeError },
  } = region;
  if (isInternalPrimitive(region, value)) {
    const primitive = leavePrimitive(region, value);
    if (primitive === undefined) {
      return undefined;
    } else {
      throw new TypeError("Cannot convert primitive to accessor");
    }
  } else {
    return value;
  }
};

/**
 * @type {(
 *   region: import("./region").Region,
 *   value: import("./domain").InternalValue,
 * ) => boolean}
 */
export const toBoolean = (region, value) =>
  isInternalPrimitive(region, value) ? !!leavePrimitive(region, value) : true;

/**
 * @type {(
 *   region: import("./region").Region,
 *   value: import("./domain").InternalValue,
 * ) => import("./domain").InternalDefineDescriptor}
 */
export const toInternalDefineDescriptor = (region, value) => {
  const {
    global: { TypeError },
  } = region;
  if (isInternalPrimitive(region, value)) {
    throw new TypeError("Cannot convert primitive to prototype");
  } else {
    /** @type {import("./domain").InternalDefineDescriptor} */
    const descriptor = { __proto__: null };
    if (hasInternal(region, value, "value")) {
      descriptor.value = getInternal(region, value, "value", value);
    }
    for (let index = 0; index < accessors.length; index++) {
      const key = accessors[index];
      if (hasInternal(region, value, key)) {
        descriptor[key] = toInternalAccessor(
          region,
          getInternal(region, value, key, value),
        );
      }
    }
    for (let index = 0; index < flags.length; index++) {
      const key = flags[index];
      if (hasInternal(region, value, key)) {
        descriptor[key] = toBoolean(
          region,
          getInternal(region, value, key, value),
        );
      }
    }
    return descriptor;
  }
};
