import { LinvailExecError, LinvailTypeError } from "../../error.mjs";
import { resolveNaN, toInteger } from "../../util/number.mjs";
import { isDataDescriptor } from "../domain.mjs";
import {
  applyInternal,
  constructInternal,
  defineInternalPropertyDescriptor,
  getInternalPropertyValue,
  hasInternalProperty,
  isInternalArray,
} from "../reflect.mjs";
import {
  wrapStandardPrimitive,
  wrapReference,
  wrapValue,
} from "../region/core.mjs";
import { createEmptyArray, createFullObject } from "../region/create.mjs";

const {
  Reflect: { defineProperty },
  Array: { from: toArray },
} = globalThis;

export const void_oracle = { apply: null, construct: null };

//////////////////
// Access Input //
//////////////////

/**
 * @type {(
 *   region: import("../region.d.ts").Region,
 *   array: import("../domain.d.ts").Wrapper[],
 *   index: number,
 * ) => import("../domain.d.ts").Wrapper}
 */
export const atInternal = (region, array, index) =>
  index < array.length
    ? array[index]
    : wrapStandardPrimitive(region, region["global.undefined"]);

/**
 * @type {(
 *   region: import("../region.d.ts").Region,
 *   array: import("../domain.d.ts").Wrapper[],
 *   index: number,
 * ) => import("../domain.d.ts").Value}
 */
export const atExternal = (region, array, index) =>
  index < array.length ? array[index].inner : region["global.undefined"];

//////////////////////////
// Convert to Reference //
//////////////////////////

/**
 * @type {(
 *   region: import("../region.d.ts").Region,
 *   value: import("../domain.d.ts").Wrapper,
 * ) => null | import("../domain.d.ts").ReferenceWrapper}
 */
export const toMaybeInternalReferenceSloppy = (region, value) => {
  switch (value.type) {
    case "primitive": {
      const { "global.Object": toObject } = region;
      return value.inner == null
        ? null
        : wrapReference(region, toObject(value.inner));
    }
    case "guest": {
      return value;
    }
    case "host": {
      return value;
    }
    default: {
      throw new LinvailTypeError(value);
    }
  }
};

/**
 * @type {(
 *   region: import("../region.d.ts").Region,
 *   value: import("../domain.d.ts").Wrapper,
 * ) => import("../domain.d.ts").ReferenceWrapper}
 */
export const toInternalReferenceSloppy = (region, value) => {
  switch (value.type) {
    case "primitive": {
      if (value.inner == null) {
        throw new region["global.TypeError"](
          "Cannot convert nullish to reference",
        );
      } else {
        const { "global.Object": toObject } = region;
        return wrapReference(region, toObject(value.inner));
      }
    }
    case "guest": {
      return value;
    }
    case "host": {
      return value;
    }
    default: {
      throw new LinvailTypeError(value);
    }
  }
};

/**
 * @type {(
 *   _region: import("../region.d.ts").Region,
 *   value: import("../domain.d.ts").Wrapper,
 * ) => null | import("../domain.d.ts").ReferenceWrapper}
 */
export const toMaybeInternalReferenceStrict = (_region, value) => {
  switch (value.type) {
    case "primitive": {
      return null;
    }
    case "guest": {
      return value;
    }
    case "host": {
      return value;
    }
    default: {
      throw new LinvailTypeError(value);
    }
  }
};

/**
 * @type {(
 *   region: import("../region.d.ts").Region,
 *   value: import("../domain.d.ts").Wrapper,
 * ) => import("../domain.d.ts").ReferenceWrapper}
 */
export const toInternalReferenceStrict = (region, value) => {
  switch (value.type) {
    case "primitive": {
      throw new region["global.TypeError"](
        "Cannot convert primitive to reference",
      );
    }
    case "guest": {
      return value;
    }
    case "host": {
      return value;
    }
    default: {
      throw new LinvailTypeError(value);
    }
  }
};

///////////
// Query //
///////////

/**
 * @type {(
 *   region: import("../region.d.ts").Region,
 *   target: import("../domain.d.ts").ReferenceWrapper,
 * ) => boolean}
 */
export const isConcatSpreadable = (region, target) => {
  const {
    "global.Symbol.isConcatSpreadable": is_concat_spreadable_symbol,
    "global.undefined": undefined,
  } = region;
  const spreadable = getInternalPropertyValue(
    region,
    target,
    is_concat_spreadable_symbol,
    target,
  ).inner;
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
 *   region: import("../region.d.ts").Region,
 *   target: import("../domain.d.ts").ReferenceWrapper,
 *   length: number,
 * ) => import("../domain.d.ts").ReferenceWrapper}
 */
export const createSpecieArray = (region, target, length) => {
  const {
    "global.undefined": undefined,
    "global.Symbol.species": species_symbol,
    "global.TypeError": TypeError,
  } = region;
  if (isInternalArray(region, target)) {
    let constructor = getInternalPropertyValue(
      region,
      target,
      "constructor",
      target,
    );
    if (constructor.type !== "primitive") {
      constructor = getInternalPropertyValue(
        region,
        constructor,
        species_symbol,
        constructor,
      );
      if (constructor.inner === null) {
        constructor = wrapStandardPrimitive(region, undefined);
      }
    }
    if (constructor.inner === undefined) {
      // BREAKING: It should be using Array.prototype fromm the target's realm
      return createEmptyArray(region, length);
    }
    if (constructor.type === "primitive") {
      throw new TypeError("Invalid array species constructor: primitive");
    }
    return constructInternal(
      region,
      constructor,
      [wrapStandardPrimitive(region, length)],
      constructor,
    );
  } else {
    return createEmptyArray(region, length);
  }
};

////////////////////////
// Closure Convertion //
////////////////////////

/**
 * @type {(
 *   region: import("../region.d.ts").Region,
 *   value: import("../domain.d.ts").Wrapper,
 * ) => import("../domain.d.ts").ReferenceWrapper}
 */
export const toInternalClosureStrict = (region, value) => {
  if (value.type === "primitive") {
    throw new region["global.TypeError"](
      "Cannot convert primitive value to function",
    );
  } else {
    if (typeof value.inner === "function") {
      return value;
    } else {
      throw new region["global.TypeError"](
        "Cannot convert object value to function",
      );
    }
  }
};

/**
 * @type {(
 *   region: import("../region.d.ts").Region,
 *   value: import("../domain.d.ts").Wrapper,
 * ) => null | import("../domain.d.ts").ReferenceWrapper}
 */
export const toInternalClosureSloppy = (region, value) =>
  value.inner === region["global.undefined"]
    ? null
    : toInternalClosureStrict(region, value);

//////////////////////////
// Prototype Convertion //
//////////////////////////

/**
 * @type {(
 *   region: import("../region.d.ts").Region,
 *   value: import("../domain.d.ts").Wrapper,
 * ) => null | import("../domain.d.ts").Reference}
 */
export const toPrototype = (region, value) => {
  if (value.type === "primitive") {
    if (value.inner === null) {
      return null;
    }
    throw new region["global.TypeError"](
      "Cannot convert primitive to prototype",
    );
  } else if (value.type === "guest" || value.type === "host") {
    return value.inner;
  } else {
    throw new LinvailTypeError(value);
  }
};

/**
 * @type {(
 *   region: import("../region.d.ts").Region,
 *   value: null | import("../domain.d.ts").Reference,
 * ) => import("../domain.d.ts").Wrapper}
 */
export const fromPrototype = (region, prototype) =>
  prototype === null
    ? wrapStandardPrimitive(region, null)
    : wrapReference(region, prototype);

///////////////////////////
// Descriptor Convertion //
///////////////////////////

/** @type {["writable", "enumerable", "configurable"]} */
const flags = ["writable", "enumerable", "configurable"];

/**
 * @type {(
 *   region: import("../region.d.ts").Region,
 *   value: import("../domain.d.ts").Wrapper,
 * ) => import("../domain.d.ts").HostDefineDescriptor}
 */
export const toInternalDefineDescriptor = (region, value) => {
  if (value.type === "primitive") {
    throw new region["global.TypeError"](
      "Cannot convert primitive to descriptor",
    );
  }
  /** @type {import("../domain.d.ts").HostDefineDescriptor} */
  const descriptor = { __proto__: null };
  if (hasInternalProperty(region, value, "value")) {
    descriptor.value = getInternalPropertyValue(region, value, "value", value);
  }
  if (hasInternalProperty(region, value, "get")) {
    descriptor.get = getInternalPropertyValue(
      region,
      value,
      "get",
      value,
    ).inner;
  }
  if (hasInternalProperty(region, value, "set")) {
    descriptor.set = getInternalPropertyValue(
      region,
      value,
      "set",
      value,
    ).inner;
  }
  for (let index = 0; index < flags.length; index++) {
    const key = flags[index];
    if (hasInternalProperty(region, value, key)) {
      descriptor[key] = !!getInternalPropertyValue(region, value, key, value)
        .inner;
    }
  }
  return descriptor;
};

/**
 * @type {(
 *   region: import("../region.d.ts").Region,
 *   descriptor: import("../domain.d.ts").HostDescriptor,
 * ) => import("../domain.d.ts").HostReferenceWrapper<"object">}
 */
export const fromInternalDescriptor = (region, descriptor) => {
  const { "global.Object.prototype": prototype } = region;
  if (isDataDescriptor(descriptor)) {
    return createFullObject(region, {
      __proto__: prototype,
      value: descriptor.value,
      writable: wrapStandardPrimitive(region, descriptor.writable),
      enumerable: wrapStandardPrimitive(region, descriptor.enumerable),
      configurable: wrapStandardPrimitive(region, descriptor.configurable),
    });
  } else {
    return createFullObject(region, {
      __proto__: prototype,
      get: wrapValue(region, descriptor.get),
      set: wrapValue(region, descriptor.set),
      enumerable: wrapStandardPrimitive(region, descriptor.enumerable),
      configurable: wrapStandardPrimitive(region, descriptor.configurable),
    });
  }
};

/**
 * @type {(
 *   region: import("../region.d.ts").Region,
 *   descriptor: import("../domain.d.ts").HostDescriptor,
 *   receiver: import("../domain.d.ts").Wrapper,
 * ) => import("../domain.d.ts").Wrapper}
 */
export const getInternalDescriptorValue = (region, descriptor, receiver) => {
  const { "global.undefined": undefined } = region;
  if (isDataDescriptor(descriptor)) {
    return descriptor.value;
  } else {
    const { get } = descriptor;
    if (get) {
      return applyInternal(region, wrapValue(region, get), receiver, []);
    } else {
      return wrapStandardPrimitive(region, undefined);
    }
  }
};

///////////
// Other //
///////////

/**
 * @type {(
 *   region: import("../region.d.ts").Region,
 *   iterator: import("../domain.d.ts").ReferenceWrapper,
 * ) => void}
 */
export const closeIterator = (region, iterator) => {
  const close = getInternalPropertyValue(region, iterator, "return", iterator);
  if (typeof close.inner === "function") {
    try {
      applyInternal(region, close, iterator, []);
    } catch {
      /* noop */
    }
  }
};

/**
 * @type {(
 *   region: import("../region.d.ts").Region,
 *   target: import("../domain.d.ts").ReferenceWrapper,
 * ) => number}
 */
export const getLength = (region, target) => {
  const { "global.Number": Number } = region;
  const length = toInteger(
    Number(getInternalPropertyValue(region, target, "length", target).inner),
    0,
  );
  return length < 0 ? 0 : length;
};

/**
 * @type {(
 *   region: import("../region.d.ts").Region,
 *   values: import("../domain.d.ts").Wrapper,
 * ) => import("../domain.d.ts").Wrapper[]}
 */
export const toInternalValueArray = (region, value) => {
  const { "global.Number": Number, "global.TypeError": TypeError } = region;
  if (value.type === "primitive") {
    throw new TypeError("Cannot convert prmitive to array");
  }
  return toArray(
    {
      length: resolveNaN(
        Number(getInternalPropertyValue(region, value, "length", value).inner),
        0,
      ),
    },
    (_, index) => getInternalPropertyValue(region, value, index, value),
  );
};

/**
 * @type {(
 *   region: import("../region.d.ts").Region,
 *   key: import("../domain.d.ts").Value,
 * ) => PropertyKey}
 */
export const toPropertyKey = (region, value) => {
  const { "global.String": String } = region;
  return typeof value === "symbol" ? value : String(value);
};

/**
 * @type {(
 *   region: import("../region.d.ts").Region,
 *   compare: null | import("../domain.d.ts").ReferenceWrapper,
 *   value1: import("../domain.d.ts").Wrapper,
 *   value2: import("../domain.d.ts").Wrapper,
 * ) => boolean}
 */
export const isStrictlyGreater = (region, compare, value1, value2) => {
  const {
    "global.String": String,
    "global.Number": Number,
    "global.undefined": undefined,
  } = region;
  if (value2.inner === undefined) {
    return false;
  }
  if (value1.inner === undefined) {
    return true;
  }
  if (compare) {
    return (
      Number(
        applyInternal(
          region,
          compare,
          wrapStandardPrimitive(region, undefined),
          [value1, value2],
        ).inner,
      ) > 0
    );
  } else {
    return String(value1.inner) > String(value2.inner);
  }
};

/**
 * @type {(
 *   region: import("../region.d.ts").Region,
 *   depth: number,
 *   item: import("../domain.d.ts").Wrapper,
 *   items: import("../domain.d.ts").ReferenceWrapper,
 *   length: number,
 * ) => number}
 */
export const flatenArray = (region, depth, item, items, length) => {
  if (depth === 0 || !isInternalArray(region, item)) {
    if (
      !defineInternalPropertyDescriptor(region, items, length, {
        __proto__: null,
        value: item,
        writable: true,
        enumerable: true,
        configurable: true,
      })
    ) {
      throw new region["global.TypeError"](
        "Cannot define array index at Array.prototype.flat",
      );
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
 *   region: import("../region.d.ts").Region,
 *   target: import("../domain.d.ts").ReferenceWrapper,
 *   transform: null | import("../domain.d.ts").ReferenceWrapper,
 *   this_arg: import("../domain.d.ts").Wrapper,
 * ) => import("../domain.d.ts").HostReferenceWrapper<"array">}
 */
export const convertArrayLike = (region, target, transform, this_arg) => {
  const { "global.Reflect.defineProperty": defineProperty } = region;
  const initial_length = getLength(region, target);
  const array = createEmptyArray(region, initial_length);
  let index = 0;
  let length = initial_length;
  while (index < length) {
    const item = getInternalPropertyValue(region, target, index, target);
    defineProperty(array.plain, index, {
      __proto__: null,
      value: transform
        ? applyInternal(region, transform, this_arg, [
            item,
            wrapStandardPrimitive(region, index),
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
    defineProperty(array.plain, "length", {
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
 *   region: import("../region.d.ts").Region,
 *   iterator: import("../domain.d.ts").ReferenceWrapper,
 *   transform: null | import("../domain.d.ts").ReferenceWrapper,
 *   this_arg: import("../domain.d.ts").Wrapper,
 * ) => import("../domain.d.ts").HostReferenceWrapper<"array">}
 */
export const convertIterator = (region, iterator, transform, this_arg) => {
  const { "global.Reflect.defineProperty": defineProperty } = region;
  let done = false;
  const next = toInternalReferenceStrict(
    region,
    getInternalPropertyValue(region, iterator, "next", iterator),
  );
  const array = createEmptyArray(region, 0);
  let index = 0;
  while (!done) {
    const step = toInternalReferenceStrict(
      region,
      applyInternal(region, next, iterator, []),
    );
    done = !!getInternalPropertyValue(region, step, "done", iterator).inner;
    if (!done) {
      let value = getInternalPropertyValue(region, step, "value", iterator);
      if (transform) {
        try {
          value = applyInternal(region, transform, this_arg, [
            value,
            wrapStandardPrimitive(region, index),
          ]);
        } catch (error) {
          closeIterator(region, iterator);
          throw error;
        }
      }
      defineProperty(array.plain, index, {
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
 *   region: import("../region.d.ts").Region,
 *   target: import("../domain.d.ts").ReferenceWrapper,
 *   length: number,
 *   compare: null | import("../domain.d.ts").ReferenceWrapper,
 *   hole: "skip" | "read",
 * ) => import("../domain.d.ts").Wrapper[]}
 */
export const sortInternalValueArray = (
  region,
  target,
  target_length,
  compare,
  hole,
) => {
  /** @type {import("../domain.d.ts").Wrapper[]} */
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
