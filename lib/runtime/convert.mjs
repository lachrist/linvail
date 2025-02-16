import { LinvailExecError } from "../error.mjs";
import { map } from "../util/array.mjs";
import { resolveNaN } from "../util/number.mjs";
import { isDataDescriptor } from "./domain.mjs";
import {
  applyInternal,
  constructInternal,
  getInternalPropertyValue,
  hasInternalProperty,
} from "./reflect.mjs";
import {
  enterPlainExternalReference,
  enterPrimitive,
  isGuestInternalReference,
  isInternalPrimitive,
  leavePlainExternalReference,
  leavePrimitive,
} from "./region/core.mjs";
import { enterPrototype, leaveReference, leaveValue } from "./region/util.mjs";

export const {
  Array: { from: toArray },
} = globalThis;

/**
 * @type {(
 *   region: import("./region/region").Region,
 *   array: import("./domain").PlainInternalArrayWithExternalPrototype,
 * ) => import("./domain").PlainInternalArray}
 */
export const fromPlainInternalArrayWithExternalPrototype = (region, array) => {
  const {
    "global.Reflect.setPrototypeOf": setPrototypeOf,
    "global.Reflect.getPrototypeOf": getPrototypeOf,
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
 *   region: import("./region/region").Region,
 *   array: import("./domain").InternalValue[],
 *   index: number,
 * ) => import("./domain").InternalValue}
 */
export const atInternal = (region, array, index) =>
  index < array.length
    ? array[index]
    : enterPrimitive(region, region["global.undefined"]);

/**
 * @type {(
 *   region: import("./region/region").Region,
 *   array: import("./domain").InternalValue[],
 *   index: number,
 * ) => import("./domain").ExternalValue}
 */
export const atExternal = (region, array, index) =>
  index < array.length
    ? leaveValue(region, array[index])
    : region["global.undefined"];

/**
 * @type {(
 *   region: import("./region/region").Region,
 *   value: import("./domain").InternalValue,
 * ) => import("./domain").InternalReference}
 */
export const toInternalReferenceSloppy = (region, value) => {
  const { "global.TypeError": TypeError, "global.Object": toObject } = region;
  if (isInternalPrimitive(region, value)) {
    const primitive = leavePrimitive(region, value);
    if (primitive == null) {
      throw new TypeError("Cannot convert nullish to reference");
    } else {
      return enterPlainExternalReference(region, toObject(primitive));
    }
  } else {
    return value;
  }
};

/**
 * @type {(
 *   region: import("./region/region").Region,
 *   values: import("./domain").InternalValue[],
 * ) => import("./domain").PlainInternalArray}
 */
export const createFullArray = (region, values) => {
  const { "global.Array.of": toArray, "global.Reflect.apply": apply } = region;
  return fromPlainInternalArrayWithExternalPrototype(
    region,
    apply(toArray, null, values),
  );
};

/**
 * @type {(
 *   region: import("./region/region").Region,
 *   target: import("./domain").InternalReference,
 * ) => boolean}
 */
const isArray = (region, target) => {
  const { "global.Array.isArray": isArray } = region;
  if (isGuestInternalReference(region, target)) {
    return isArray(leavePlainExternalReference(region, target));
  } else {
    return isArray(target);
  }
};

/**
 * @type {(
 *   region: import("./region/region").Region,
 *   target: import("./domain").InternalReference,
 * ) => boolean}
 */
export const isConcatSpreadable = (region, target) => {
  const {
    "global.Symbol.isConcatSpreadable": is_concat_spreadable_symbol,
    "global.undefined": undefined,
  } = region;
  const spreadable = leaveValue(
    region,
    getInternalPropertyValue(
      region,
      target,
      is_concat_spreadable_symbol,
      target,
    ),
  );
  if (spreadable === undefined) {
    return isArray(region, target);
  } else {
    return !!spreadable;
  }
};

/**
 * @type {(
 *   region: import("./region/region").Region,
 *   length: number,
 * ) => import("./domain").PlainInternalArray}
 */
export const createArray = (region, length) => {
  const { "global.Array": Array } = region;
  return fromPlainInternalArrayWithExternalPrototype(region, new Array(length));
};

/**
 * @type {(
 *   region: import("./region/region").Region,
 *   target: import("./domain").InternalReference,
 *   length: number,
 * ) => import("./domain").InternalReference}
 */
export const createSpecieArray = (region, target, length) => {
  const {
    "global.undefined": undefined,
    "global.Symbol.species": species_symbol,
    "global.TypeError": TypeError,
    "global.Array": Array,
    "global.Array.isArray": isArray,
  } = region;
  if (
    isGuestInternalReference(region, target)
      ? isArray(leavePlainExternalReference(region, target))
      : isArray(target)
  ) {
    let constructor = getInternalPropertyValue(
      region,
      target,
      "constructor",
      target,
    );
    if (!isInternalPrimitive(region, constructor)) {
      constructor = getInternalPropertyValue(
        region,
        constructor,
        species_symbol,
        constructor,
      );
      if (
        isInternalPrimitive(region, constructor) &&
        leavePrimitive(region, constructor) === null
      ) {
        constructor = enterPrimitive(region, undefined);
      }
    }
    if (isInternalPrimitive(region, constructor)) {
      if (leavePrimitive(region, constructor) === undefined) {
        return fromPlainInternalArrayWithExternalPrototype(
          region,
          new Array(length),
        );
      } else {
        throw new TypeError("Invalid array species constructor: primitive");
      }
    } else {
      return constructInternal(
        region,
        constructor,
        [enterPrimitive(region, length)],
        constructor,
      );
    }
  } else {
    return fromPlainInternalArrayWithExternalPrototype(
      region,
      new Array(length),
    );
  }
};

/**
 * @type {(
 *   region: import("./region/region").Region,
 *   value: import("./domain").InternalValue,
 * ) => null | import("./domain").InternalReference}
 */
export const toInternalClosureSloppy = (region, value) => {
  const { "global.undefined": undefined, "global.TypeError": TypeError } =
    region;
  if (isInternalPrimitive(region, value)) {
    const primitive = leavePrimitive(region, value);
    if (primitive === undefined) {
      return null;
    } else {
      throw new TypeError("Cannot convert primitive value to function");
    }
  } else {
    if (typeof leaveReference(region, value) === "function") {
      return value;
    } else {
      throw new TypeError("Cannot convert object value to function");
    }
  }
};

/**
 * @type {(
 *   region: import("./region/region").Region,
 *   value: import("./domain").InternalValue,
 * ) => import("./domain").InternalReference}
 */
export const toInternalClosureStrict = (region, value) => {
  const { "global.TypeError": TypeError } = region;
  if (isInternalPrimitive(region, value)) {
    throw new TypeError("Cannot convert primitive to function");
  } else {
    if (typeof leaveReference(region, value) === "function") {
      return value;
    } else {
      throw new TypeError("Cannot convert object value to function");
    }
  }
};

/**
 * @type {(
 *   region: import("./region/region").Region,
 *   value: import("./domain").InternalValue,
 * ) => import("./domain").InternalReference}
 */
export const toInternalReferenceStrict = (region, value) => {
  const { "global.TypeError": TypeError } = region;
  if (isInternalPrimitive(region, value)) {
    throw new TypeError("Cannot convert primitive to reference");
  } else {
    return value;
  }
};

/**
 * @type {(
 *   region: import("./region/region").Region,
 *   value: import("./domain").InternalValue,
 * ) => import("./domain").InternalPrototype}
 */
export const toInternalPrototype = (region, value) => {
  const { "global.TypeError": TypeError } = region;
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

/**
 * @type {(
 *   region: import("./region/region").Region,
 *   value: import("./domain").InternalPrototype,
 * ) => import("./domain").InternalValue}
 */
export const fromInternalPrototype = (region, prototype) =>
  prototype === null ? enterPrimitive(region, null) : prototype;

/** @type {["get", "set"]} */
const accessors = ["get", "set"];

/** @type {["writable", "enumerable", "configurable"]} */
const flags = ["writable", "enumerable", "configurable"];

/**
 * @type {(
 *   region: import("./region/region").Region,
 *   value: import("./domain").InternalValue,
 * ) => import("./domain").InternalAccessor}
 */
export const toInternalAccessor = (region, value) => {
  const { "global.undefined": undefined, "global.TypeError": TypeError } =
    region;
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
 *   region: import("./region/region").Region,
 *   value: import("./domain").InternalAccessor,
 * ) => import("./domain").InternalValue}
 */
export const fromInternalAccessor = (region, accessor) =>
  accessor || enterPrimitive(region, accessor);

/**
 * @type {(
 *   region: import("./region/region").Region,
 *   value: import("./domain").InternalValue,
 * ) => boolean}
 */
export const toBoolean = (region, value) =>
  isInternalPrimitive(region, value) ? !!leavePrimitive(region, value) : true;

/**
 * @type {(
 *   region: import("./region/region").Region,
 *   primitives: import("../util/primitive").Primitive[],
 * ) => import("./domain").PlainInternalArray}
 */
export const fromPrimitiveArray = (region, primitives) => {
  const {
    "global.undefined": undefined,
    "global.Reflect.apply": apply,
    "global.Array.of": toArray,
  } = region;
  return fromPlainInternalArrayWithExternalPrototype(
    region,
    apply(
      toArray,
      undefined,
      map(primitives, (primitive) => enterPrimitive(region, primitive)),
    ),
  );
};

/**
 * @type {(
 *   region: import("./region/region").Region,
 *   value: import("./domain").InternalValue,
 * ) => import("./domain").InternalDefineDescriptor}
 */
export const toInternalDefineDescriptor = (region, value) => {
  const { "global.TypeError": TypeError } = region;
  if (isInternalPrimitive(region, value)) {
    throw new TypeError("Cannot convert primitive to prototype");
  } else {
    /** @type {import("./domain").InternalDefineDescriptor} */
    const descriptor = { __proto__: null };
    if (hasInternalProperty(region, value, "value")) {
      descriptor.value = getInternalPropertyValue(
        region,
        value,
        "value",
        value,
      );
    }
    for (let index = 0; index < accessors.length; index++) {
      const key = accessors[index];
      if (hasInternalProperty(region, value, key)) {
        descriptor[key] = toInternalAccessor(
          region,
          getInternalPropertyValue(region, value, key, value),
        );
      }
    }
    for (let index = 0; index < flags.length; index++) {
      const key = flags[index];
      if (hasInternalProperty(region, value, key)) {
        descriptor[key] = toBoolean(
          region,
          getInternalPropertyValue(region, value, key, value),
        );
      }
    }
    return descriptor;
  }
};

/**
 * @type {(
 *   literal: {
 *     [key in string]: key extends "__proto__"
 *       ? import("./domain").InternalPrototype
 *       : import("./domain").InternalValue
 *   },
 * ) => import("./domain").PlainInternalObject}
 */
export const fromObjectLiteral = (literal) => /** @type {any} */ (literal);

/**
 * @type {(
 *   region: import("./region/region").Region,
 *   descriptor: import("./domain").InternalDescriptor,
 * ) => import("./domain").PlainInternalObject}
 */
export const fromInternalDescriptor = (region, descriptor) => {
  const { "global.Object.prototype": prototype } = region;
  if (isDataDescriptor(descriptor)) {
    return fromObjectLiteral({
      __proto__: enterPlainExternalReference(region, prototype),
      value: descriptor.value,
      writable: enterPrimitive(region, descriptor.writable),
      enumerable: enterPrimitive(region, descriptor.enumerable),
      configurable: enterPrimitive(region, descriptor.configurable),
    });
  } else {
    return fromObjectLiteral({
      __proto__: enterPlainExternalReference(region, prototype),
      get: fromInternalAccessor(region, descriptor.get),
      set: fromInternalAccessor(region, descriptor.set),
      enumerable: enterPrimitive(region, descriptor.enumerable),
      configurable: enterPrimitive(region, descriptor.configurable),
    });
  }
};

/**
 * @type {(
 *   region: import("./region/region").Region,
 *   values: import("./domain").InternalValue[],
 * ) => import("./domain").PlainInternalArray}
 */
export const fromInternalValueArray = (region, values) => {
  const {
    "global.undefined": undefined,
    "global.Array.of": toArray,
    "global.Reflect.apply": apply,
  } = region;
  return fromPlainInternalArrayWithExternalPrototype(
    region,
    apply(toArray, undefined, values),
  );
};

/**
 * @type {(
 *   region: import("./region/region").Region,
 *   value: import("./domain").ExternalValue,
 * ) => number}
 */
export const clampInteger = (region, value) => {
  const {
    "global.isNaN": isNaN,
    "global.Number": Number,
    "global.Math.trunc": trunc,
    "global.Number.MAX_SAFE_INTEGER": MAX_SAFE_INTEGER,
    "global.Number.MIN_SAFE_INTEGER": MIN_SAFE_INTEGER,
  } = region;
  const number = Number(value);
  if (isNaN(number)) {
    return 0;
  } else if (number > MAX_SAFE_INTEGER) {
    return MAX_SAFE_INTEGER;
  } else if (number < MIN_SAFE_INTEGER) {
    return MIN_SAFE_INTEGER;
  } else {
    return trunc(number);
  }
};

/**
 * @type {(
 *   region: import("./region/region").Region,
 *   value: import("./domain").ExternalValue,
 * ) => number}
 */
export const clampPositiveInteger = (region, value) => {
  const {
    "global.isNaN": isNaN,
    "global.Number": Number,
    "global.Math.trunc": trunc,
    "global.Number.MAX_SAFE_INTEGER": MAX_SAFE_INTEGER,
  } = region;
  const number = Number(value);
  if (isNaN(number)) {
    return 0;
  } else if (number > MAX_SAFE_INTEGER) {
    return MAX_SAFE_INTEGER;
  } else if (number < 0) {
    return 0;
  } else {
    return trunc(number);
  }
};

/**
 * @type {(
 *   region: import("./region/region").Region,
 *   iterator: import("./domain").InternalReference,
 * ) => void}
 */
export const closeIterator = (region, iterator) => {
  const close = getInternalPropertyValue(region, iterator, "return", iterator);
  if (!isInternalPrimitive(region, close)) {
    try {
      applyInternal(region, close, iterator, []);
    } catch {
      /* noop */
    }
  }
};

/**
 * @type {(
 *   region: import("./region/region").Region,
 *   descriptor: import("./domain").InternalDescriptor,
 *   receiver: import("./domain").InternalValue,
 * ) => import("./domain").InternalValue}
 */
export const getInternalDescriptorValue = (region, descriptor, receiver) => {
  const { "global.undefined": undefined } = region;
  if (isDataDescriptor(descriptor)) {
    return descriptor.value;
  } else {
    const { get } = descriptor;
    if (get) {
      return applyInternal(region, get, receiver, []);
    } else {
      return enterPrimitive(region, undefined);
    }
  }
};

/**
 * @type {(
 *   region: import("./region/region").Region,
 *   values: import("./domain").InternalValue,
 * ) => import("./domain").InternalValue[]}
 */
export const toInternalValueArray = (region, value) => {
  const { "global.Number": Number, "global.TypeError": TypeError } = region;
  if (isInternalPrimitive(region, value)) {
    throw new TypeError("Cannot convert prmitive to array");
  }
  return toArray(
    {
      length: resolveNaN(
        Number(
          leaveValue(
            region,
            getInternalPropertyValue(region, value, "length", value),
          ),
        ),
        0,
      ),
    },
    (_, index) => getInternalPropertyValue(region, value, index, value),
  );
};

/**
 * @type {(
 *   region: import("./region/region").Region,
 *   key: import("./domain").ExternalValue,
 * ) => PropertyKey}
 */
export const toPropertyKey = (region, value) => {
  const { "global.String": String } = region;
  return typeof value === "symbol" ? value : String(value);
};
