import { LinvailExecError } from "../../error.mjs";
import { resolveNaN, toInteger } from "../../util/number.mjs";
import { isDataDescriptor } from "../domain.mjs";
import {
  applyInternal,
  constructInternal,
  defineInternalPropertyDescriptor,
  getInternalPropertyValue,
  hasInternalProperty,
} from "../reflect.mjs";
import {
  enterPlainExternalReference,
  sanitizePlainInternalArrayWithExternalPrototype,
  enterPrimitive,
  isGuestInternalReference,
  isInternalPrimitive,
  leavePlainExternalReference,
  leavePrimitive,
} from "../region/core.mjs";
import { leaveReference, leaveValue } from "../region/util.mjs";

const {
  Reflect: { defineProperty },
  Array: { from: toArray },
} = globalThis;

//////////////////
// Access Input //
//////////////////

/**
 * @type {(
 *   region: import("../region/region.d.ts").Region,
 *   array: import("../domain.d.ts").InternalValue[],
 *   index: number,
 * ) => import("../domain.d.ts").InternalValue}
 */
export const atInternal = (region, array, index) =>
  index < array.length
    ? array[index]
    : enterPrimitive(region, region["global.undefined"]);

/**
 * @type {(
 *   region: import("../region/region.d.ts").Region,
 *   array: import("../domain.d.ts").InternalValue[],
 *   index: number,
 * ) => import("../domain.d.ts").ExternalValue}
 */
export const atExternal = (region, array, index) =>
  index < array.length
    ? leaveValue(region, array[index])
    : region["global.undefined"];

//////////////////////////
// Convert to Reference //
//////////////////////////

/**
 * @type {(
 *   region: import("../region/region.d.ts").Region,
 *   value: import("../domain.d.ts").InternalValue,
 * ) => null | import("../domain.d.ts").InternalReference}
 */
export const toMaybeInternalReferenceSloppy = (region, value) => {
  const { "global.Object": toObject } = region;
  if (isInternalPrimitive(region, value)) {
    const primitive = leavePrimitive(region, value);
    if (primitive == null) {
      return null;
    } else {
      return enterPlainExternalReference(region, toObject(primitive));
    }
  } else {
    return value;
  }
};

/**
 * @type {(
 *   region: import("../region/region.d.ts").Region,
 *   value: import("../domain.d.ts").InternalValue,
 * ) => import("../domain.d.ts").InternalReference}
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
 *   region: import("../region/region.d.ts").Region,
 *   value: import("../domain.d.ts").InternalValue,
 * ) => null | import("../domain.d.ts").InternalReference}
 */
export const toMaybeInternalReferenceStrict = (region, value) => {
  if (isInternalPrimitive(region, value)) {
    return null;
  } else {
    return value;
  }
};

/**
 * @type {(
 *   region: import("../region/region.d.ts").Region,
 *   value: import("../domain.d.ts").InternalValue,
 * ) => import("../domain.d.ts").InternalReference}
 */
export const toInternalReferenceStrict = (region, value) => {
  const { "global.TypeError": TypeError } = region;
  if (isInternalPrimitive(region, value)) {
    throw new TypeError("Cannot convert primitive to reference");
  } else {
    return value;
  }
};

///////////
// Query //
///////////

/**
 * @type {(
 *   region: import("../region/region.d.ts").Region,
 *   value: import("../domain.d.ts").InternalValue,
 * ) => boolean}
 */
export const toBoolean = (region, value) =>
  isInternalPrimitive(region, value) ? !!leavePrimitive(region, value) : true;

/**
 * @type {(
 *   region: import("../region/region.d.ts").Region,
 *   target: import("../domain.d.ts").InternalReference,
 * ) => boolean}
 */
export const isInternalArray = (region, target) => {
  const { "global.Array.isArray": isArray } = region;
  if (isGuestInternalReference(region, target)) {
    return isArray(leavePlainExternalReference(region, target));
  } else {
    return isArray(target);
  }
};

/**
 * @type {(
 *   region: import("../region/region.d.ts").Region,
 *   target: import("../domain.d.ts").InternalReference,
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
    return isInternalArray(region, target);
  } else {
    return !!spreadable;
  }
};

//////////////////
// Create Array //
//////////////////

/**
 * @type {(
 *   region: import("../region/region.d.ts").Region,
 *   values: import("../domain.d.ts").InternalValue[],
 * ) => import("../domain.d.ts").PlainInternalArray}
 */
export const fromInternalValueArray = (region, values) => {
  const {
    "global.Array.of": toArray,
    "global.Reflect.apply": apply,
    "global.Array.prototype": array_prototype,
  } = region;
  return sanitizePlainInternalArrayWithExternalPrototype(
    region,
    apply(toArray, null, values),
    enterPlainExternalReference(region, array_prototype),
  );
};

/**
 * @type {(
 *   region: import("../region/region.d.ts").Region,
 *   length: number,
 * ) => import("../domain.d.ts").PlainInternalArray}
 */
export const createArray = (region, length) => {
  const { "global.Array": Array, "global.Array.prototype": array_prototype } =
    region;
  return sanitizePlainInternalArrayWithExternalPrototype(
    region,
    new Array(length),
    enterPlainExternalReference(region, array_prototype),
  );
};

/**
 * @type {(
 *   region: import("../region/region.d.ts").Region,
 *   target: import("../domain.d.ts").InternalReference,
 *   length: number,
 * ) => import("../domain.d.ts").InternalReference}
 */
export const createSpecieArray = (region, target, length) => {
  const {
    "global.undefined": undefined,
    "global.Symbol.species": species_symbol,
    "global.TypeError": TypeError,
    "global.Array": Array,
    "global.Array.isArray": isArray,
    "global.Array.prototype": array_prototype,
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
        return sanitizePlainInternalArrayWithExternalPrototype(
          region,
          new Array(length),
          // BREAKING: should be using Array.prototype fromm the target's realm
          enterPlainExternalReference(region, array_prototype),
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
    return sanitizePlainInternalArrayWithExternalPrototype(
      region,
      new Array(length),
      enterPlainExternalReference(region, array_prototype),
    );
  }
};

////////////////////////
// Closure Convertion //
////////////////////////

/**
 * @type {(
 *   region: import("../region/region.d.ts").Region,
 *   value: import("../domain.d.ts").InternalValue,
 * ) => null | import("../domain.d.ts").InternalReference}
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
 *   region: import("../region/region.d.ts").Region,
 *   value: import("../domain.d.ts").InternalValue,
 * ) => import("../domain.d.ts").InternalReference}
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

//////////////////////////
// Prototype Convertion //
//////////////////////////

/**
 * @type {(
 *   region: import("../region/region.d.ts").Region,
 *   value: import("../domain.d.ts").InternalValue,
 * ) => import("../domain.d.ts").InternalPrototype}
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
 *   region: import("../region/region.d.ts").Region,
 *   value: import("../domain.d.ts").InternalPrototype,
 * ) => import("../domain.d.ts").InternalValue}
 */
export const fromInternalPrototype = (region, prototype) =>
  prototype === null ? enterPrimitive(region, null) : prototype;

///////////////////////////
// Descriptor Convertion //
///////////////////////////

/** @type {["get", "set"]} */
const accessors = ["get", "set"];

/** @type {["writable", "enumerable", "configurable"]} */
const flags = ["writable", "enumerable", "configurable"];

/**
 * @type {(
 *   region: import("../region/region.d.ts").Region,
 *   value: import("../domain.d.ts").InternalValue,
 * ) => import("../domain.d.ts").InternalAccessor}
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
 *   region: import("../region/region.d.ts").Region,
 *   value: import("../domain.d.ts").InternalAccessor,
 * ) => import("../domain.d.ts").InternalValue}
 */
export const fromInternalAccessor = (region, accessor) =>
  accessor || enterPrimitive(region, accessor);

/**
 * @type {(
 *   region: import("../region/region.d.ts").Region,
 *   value: import("../domain.d.ts").InternalValue,
 * ) => import("../domain.d.ts").InternalDefineDescriptor}
 */
export const toInternalDefineDescriptor = (region, value) => {
  const { "global.TypeError": TypeError } = region;
  if (isInternalPrimitive(region, value)) {
    throw new TypeError("Cannot convert primitive to prototype");
  } else {
    /** @type {import("../domain.d.ts").InternalDefineDescriptor} */
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
 *       ? import("../domain.d.ts").InternalPrototype
 *       : import("../domain.d.ts").InternalValue
 *   },
 * ) => import("../domain.d.ts").PlainInternalObject}
 */
const fromObjectLiteral = (literal) => /** @type {any} */ (literal);

/**
 * @type {(
 *   region: import("../region/region.d.ts").Region,
 *   descriptor: import("../domain.d.ts").InternalDescriptor,
 * ) => import("../domain.d.ts").PlainInternalObject}
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
 *   region: import("../region/region.d.ts").Region,
 *   descriptor: import("../domain.d.ts").InternalDescriptor,
 *   receiver: import("../domain.d.ts").InternalValue,
 * ) => import("../domain.d.ts").InternalValue}
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

///////////
// Other //
///////////

/**
 * @type {(
 *   region: import("../region/region.d.ts").Region,
 *   iterator: import("../domain.d.ts").InternalReference,
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
 *   region: import("../region/region.d.ts").Region,
 *   target: import("../domain.d.ts").InternalReference,
 * ) => number}
 */
export const getLength = (region, target) => {
  const { "global.Number": Number } = region;
  const length = toInteger(
    Number(
      leaveValue(
        region,
        getInternalPropertyValue(region, target, "length", target),
      ),
    ),
    0,
  );
  return length < 0 ? 0 : length;
};

/**
 * @type {(
 *   region: import("../region/region.d.ts").Region,
 *   values: import("../domain.d.ts").InternalValue,
 * ) => import("../domain.d.ts").InternalValue[]}
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
 *   region: import("../region/region.d.ts").Region,
 *   key: import("../domain.d.ts").ExternalValue,
 * ) => PropertyKey}
 */
export const toPropertyKey = (region, value) => {
  const { "global.String": String } = region;
  return typeof value === "symbol" ? value : String(value);
};

/**
 * @type {(
 *   region: import("../region/region.d.ts").Region,
 *   compare: null | import("../domain.d.ts").InternalReference,
 *   value1: import("../domain.d.ts").InternalValue,
 *   value2: import("../domain.d.ts").InternalValue,
 * ) => boolean}
 */
export const isStrictlyGreater = (region, compare, value1, value2) => {
  const {
    "global.String": String,
    "global.Number": Number,
    "global.undefined": undefined,
  } = region;
  if (
    isInternalPrimitive(region, value2) &&
    leavePrimitive(region, value2) === undefined
  ) {
    return false;
  }
  if (
    isInternalPrimitive(region, value1) &&
    leavePrimitive(region, value1) === undefined
  ) {
    return true;
  }
  if (compare) {
    return (
      Number(
        leaveValue(
          region,
          applyInternal(region, compare, enterPrimitive(region, undefined), [
            value1,
            value2,
          ]),
        ),
      ) > 0
    );
  } else {
    return (
      String(leaveValue(region, value1)) > String(leaveValue(region, value2))
    );
  }
};

/**
 * @type {(
 *   region: import("../region/region.d.ts").Region,
 *   depth: number,
 *   item: import("../domain.d.ts").InternalValue,
 *   items: import("../domain.d.ts").InternalReference,
 *   length: number,
 * ) => number}
 */
export const flatenArray = (region, depth, item, items, length) => {
  const { "global.TypeError": TypeError } = region;
  if (
    depth === 0 ||
    isInternalPrimitive(region, item) ||
    !isInternalArray(region, item)
  ) {
    if (
      !defineInternalPropertyDescriptor(region, items, length, {
        __proto__: null,
        value: item,
        writable: true,
        enumerable: true,
        configurable: true,
      })
    ) {
      throw new TypeError("Cannot define array index at Array.prototype.flat");
    }
    return length + 1;
  } else {
    const item_length = getLength(region, item);
    for (let index = 0; index < item_length; index++) {
      length = flatenArray(
        region,
        depth - 1,
        getInternalPropertyValue(region, item, index, item),
        items,
        length,
      );
    }
    return length;
  }
};

/**
 * @type {(
 *   region: import("../region/region.d.ts").Region,
 *   target: import("../domain.d.ts").InternalReference,
 *   transform: null | import("../domain.d.ts").InternalReference,
 *   this_arg: import("../domain.d.ts").InternalValue,
 * ) => import("../domain.d.ts").PlainInternalArray}
 */
export const convertArrayLike = (region, target, transform, this_arg) => {
  const { "global.Reflect.defineProperty": defineProperty } = region;
  const initial_length = getLength(region, target);
  const array = createArray(region, initial_length);
  let index = 0;
  let length = initial_length;
  while (index < length) {
    const item = getInternalPropertyValue(region, target, index, target);
    defineProperty(array, index, {
      __proto__: null,
      value: transform
        ? applyInternal(region, transform, this_arg, [
            item,
            enterPrimitive(region, index),
          ])
        : item,
      writable: true,
      enumerable: true,
      configurable: true,
    });
    index++;
    length = getLength(region, target);
  }
  if (length < initial_length) {
    defineProperty(array, "length", {
      __proto__: null,
      value: length,
      writable: true,
      enumerable: false,
      configurable: false,
    });
  }
  return array;
};

/**
 * @type {(
 *   region: import("../region/region.d.ts").Region,
 *   iterator: import("../domain.d.ts").InternalReference,
 *   transform: null | import("../domain.d.ts").InternalReference,
 *   this_arg: import("../domain.d.ts").InternalValue,
 * ) => import("../domain.d.ts").PlainInternalArray}
 */
export const convertIterator = (region, iterator, transform, this_arg) => {
  const { "global.Reflect.defineProperty": defineProperty } = region;
  let done = false;
  const next = toInternalReferenceStrict(
    region,
    getInternalPropertyValue(region, iterator, "next", iterator),
  );
  const array = createArray(region, 0);
  let index = 0;
  while (!done) {
    const step = toInternalReferenceStrict(
      region,
      applyInternal(region, next, iterator, []),
    );
    done = toBoolean(
      region,
      getInternalPropertyValue(region, step, "done", iterator),
    );
    if (!done) {
      let value = getInternalPropertyValue(region, step, "value", iterator);
      if (transform) {
        try {
          value = applyInternal(region, transform, this_arg, [
            value,
            enterPrimitive(region, index),
          ]);
        } catch (error) {
          closeIterator(region, iterator);
          throw error;
        }
      }
      defineProperty(array, index, {
        __proto__: null,
        value,
        writable: true,
        enumerable: true,
        configurable: true,
      });
      index++;
    }
  }
  return array;
};

/**
 * @type {(
 *   region: import("../region/region.d.ts").Region,
 *   target: import("../domain.d.ts").InternalReference,
 *   length: number,
 *   compare: null | import("../domain.d.ts").InternalReference,
 *   hole: "skip" | "read",
 * ) => import("../domain.d.ts").InternalValue[]}
 */
export const sortInternalValueArray = (
  region,
  target,
  target_length,
  compare,
  hole,
) => {
  /** @type {import("../domain.d.ts").InternalValue[]} */
  const copy = [];
  let copy_length = 0;
  for (let index = 0; index < target_length; index++) {
    if (hole === "read" || hasInternalProperty(region, target, index)) {
      const descriptor = {
        __proto__: null,
        value: getInternalPropertyValue(region, target, index, target),
        writable: true,
        enumerable: true,
        configurable: true,
      };
      if (!defineProperty(copy, copy_length++, descriptor)) {
        throw new LinvailExecError(
          "Cannot define array index at Array.prototype.sort",
          { copy, copy_length, descriptor },
        );
      }
    }
  }
  while (true) {
    let fix = true;
    for (let index = 0; index < copy_length - 1; index++) {
      const curr_item = copy[index];
      const next_item = copy[index + 1];
      if (isStrictlyGreater(region, compare, curr_item, next_item)) {
        fix = false;
        copy[index] = next_item;
        copy[index + 1] = curr_item;
      }
    }
    if (fix) {
      return copy;
    }
  }
};
