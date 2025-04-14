import { clamp, incrementWhenNegative, toInteger } from "../../util/number.mjs";
import { hasOwnNarrow } from "../../util/record.mjs";
import {
  atExternal,
  atInternal,
  createSpecieArray,
  toInternalClosureSloppy,
  toInternalClosureStrict,
  toInternalReferenceSloppy,
  toInternalReferenceStrict,
  isConcatSpreadable,
  getLength,
  convertArrayLike,
  convertIterator,
  flatenArray,
  isInternalArray,
  sortInternalValueArray,
} from "./helper.mjs";
import {
  applyInternal,
  defineInternalPropertyDescriptor,
  deleteInternalOwnProperty,
  getInternalPropertyValue,
  hasInternalProperty,
  setInternalPropertyValue,
} from "../reflect.mjs";
import {
  wrapStandardPrimitive,
  createEmptyArray,
  createFullArray,
} from "../region/core.mjs";

const {
  Math: { max, min, floor },
} = globalThis;

/**
 * @type {Record<
 *   "global.Array",
 *   import("../oracle.d.ts").ConstructOracle
 * >}
 */
export const array_construct_oracle_mapping = {
  "global.Array": (region, input, new_target) => {
    const { "global.Reflect.setPrototypeOf": setPrototypeOf } = region;
    const argument0 = atExternal(region, input, 0);
    /** @type {import("../domain.js").HostReferenceWrapper<"array">} */
    let result;
    /* BREAKAGE: we should use array_prototype from new_target's realm */
    if (input.length === 1 && typeof argument0 === "number") {
      const length = toInteger(argument0, 0);
      if (argument0 !== length) {
        throw new region["global.RangeError"]("Invalid array length at Array");
      }
      result = createEmptyArray(region, length);
    } else {
      result = createFullArray(region, input);
    }
    const prototype = getInternalPropertyValue(
      region,
      new_target,
      "prototype",
      new_target,
    );
    if (prototype.type !== "primitive") {
      if (!setPrototypeOf(result.plain, prototype.inner)) {
        throw new region["global.TypeError"]("Cannot set prototype of array");
      }
    }
    return result;
  },
};

/**
 * @type {Record<
 *   (
 *     | "global.Array"
 *     | `global.Array.${Exclude<keyof typeof Array, symbol>}`
 *     | `global.Array.prototype.${Exclude<keyof typeof Array.prototype, symbol>}`
 *   ),
 *   null | import("../oracle.d.ts").ApplyOracle
 * >}
 */
export const array_apply_oracle_mapping = {
  "global.Array": (region, _that, input) => {
    const { "global.RangeError": RangeError } = region;
    const argument0 = atExternal(region, input, 0);
    if (input.length === 1 && typeof argument0 === "number") {
      const length = toInteger(argument0, 0);
      if (argument0 !== length) {
        throw new RangeError("Invalid array length at Array");
      }
      return createEmptyArray(region, length);
    } else {
      return createFullArray(region, input);
    }
  },
  "global.Array.from": (region, _that, input) => {
    const {
      "global.TypeError": TypeError,
      "global.Symbol.iterator": iterator_symbol,
      "global.Array.prototype[@@iterator]": array_iterator,
      "global.Object.is": is,
    } = region;
    const target = toInternalReferenceSloppy(
      region,
      atInternal(region, input, 0),
    );
    const transform = toInternalClosureSloppy(
      region,
      atInternal(region, input, 1),
    );
    const this_arg = atInternal(region, input, 2);
    const generate = getInternalPropertyValue(
      region,
      target,
      iterator_symbol,
      target,
    );
    if (generate.type === "primitive") {
      if (generate.inner == null) {
        return convertArrayLike(region, target, transform, this_arg);
      } else {
        throw new TypeError("@@iterator is not a function at Array.from");
      }
    } else {
      if (is(generate.inner, array_iterator)) {
        return convertArrayLike(region, target, transform, this_arg);
      } else {
        return convertIterator(
          region,
          toInternalReferenceStrict(
            region,
            applyInternal(region, generate, target, []),
          ),
          transform,
          this_arg,
        );
      }
    }
  },
  "global.Array.isArray": null, // no benefit,
  "global.Array.of": (region, _that, input) => createFullArray(region, input),
  "global.Array.prototype": null, // not a function
  "global.Array.prototype.at": (region, that, input) => {
    const { "global.undefined": undefined, "global.Number": Number } = region;
    const target = toInternalReferenceSloppy(region, that);
    const length = getLength(region, target);
    const index = incrementWhenNegative(
      toInteger(Number(atExternal(region, input, 0)), 0),
      length,
    );
    if (index < 0 || index >= length) {
      return wrapStandardPrimitive(region, undefined);
    } else {
      return getInternalPropertyValue(region, target, index, target);
    }
  },
  "global.Array.prototype.concat": (region, that, input) => {
    const {
      "global.TypeError": TypeError,
      "global.Number.MAX_SAFE_INTEGER": MAX_SAFE_INTEGER,
    } = region;
    const target = toInternalReferenceSloppy(region, that);
    const result = createSpecieArray(region, target, 0);
    let result_length = 0;
    const input_length = input.length;
    for (let index = -1; index < input_length; index++) {
      const current = index === -1 ? target : input[index];
      if (
        (current.type === "host" || current.type === "guest") &&
        isConcatSpreadable(region, current)
      ) {
        const current_length = getLength(region, current);
        if (result_length + current_length >= MAX_SAFE_INTEGER) {
          throw new TypeError(
            "Array length exceeds maximum safe integer at Array.prototype.concat",
          );
        }
        for (let index = 0; index < current_length; index++) {
          if (hasInternalProperty(region, current, index)) {
            if (
              !defineInternalPropertyDescriptor(region, result, result_length, {
                __proto__: null,
                value: getInternalPropertyValue(
                  region,
                  current,
                  index,
                  current,
                ),
                writable: true,
                enumerable: true,
                configurable: true,
              })
            ) {
              throw new TypeError(
                "Cannot define array index at Array.prototype.concat",
              );
            }
          } else {
            if (
              !defineInternalPropertyDescriptor(region, result, "length", {
                __proto__: null,
                value: wrapStandardPrimitive(region, result_length + 1),
                writable: true,
                enumerable: false,
                configurable: false,
              })
            ) {
              throw new TypeError(
                "Cannot define array length at Array.prototype.concat",
              );
            }
          }
          result_length++;
        }
      } else {
        if (result_length >= MAX_SAFE_INTEGER) {
          throw new TypeError(
            "Array length exceeds maximum safe integer at Array.prototype.concat",
          );
        }
        if (
          !defineInternalPropertyDescriptor(region, result, result_length, {
            __proto__: null,
            value: current,
            writable: true,
            enumerable: true,
            configurable: true,
          })
        ) {
          throw new TypeError(
            "Cannot define array index at Array.prototype.concat",
          );
        }
        result_length++;
      }
    }
    return result;
  },
  "global.Array.prototype.copyWithin": (region, that, input) => {
    const {
      "global.TypeError": TypeError,
      "global.Number": Number,
      "global.undefined": undefined,
    } = region;
    const target = toInternalReferenceSloppy(region, that);
    const length = getLength(region, target);
    const index1 = max(
      0,
      incrementWhenNegative(
        toInteger(Number(atExternal(region, input, 0)), 0),
        length,
      ),
    );
    const index2 = max(
      0,
      incrementWhenNegative(
        toInteger(Number(atExternal(region, input, 1)), 0),
        length,
      ),
    );
    const argument2 = atExternal(region, input, 2);
    const index3 = min(
      length,
      argument2 === undefined
        ? length
        : incrementWhenNegative(toInteger(Number(argument2), 0), length),
    );
    let count = index3 - index2;
    if (count + index1 > length) {
      count = length - index1;
    }
    const direction = index1 <= index2 ? 1 : -1;
    let target_index = direction > 0 ? index1 : index1 + count - 1;
    let source_index = direction > 0 ? index2 : index2 + count - 1;
    for (let index = 0; index < count; index++) {
      if (hasInternalProperty(region, target, source_index)) {
        if (
          !setInternalPropertyValue(
            region,
            target,
            target_index,
            getInternalPropertyValue(region, target, source_index, target),
            target,
          )
        ) {
          throw new TypeError(
            "Cannot set array index at Array.prototype.copyWithin",
          );
        }
      } else {
        if (!deleteInternalOwnProperty(region, target, target_index)) {
          throw new TypeError(
            "Cannot delete array index at Array.prototype.copyWithin",
          );
        }
      }
      target_index += direction;
      source_index += direction;
    }
    return target;
  },
  "global.Array.prototype.entries": null, // returns exotic array iterator object
  "global.Array.prototype.every": (region, that, input) => {
    const target = toInternalReferenceSloppy(region, that);
    const predicate = toInternalClosureStrict(
      region,
      atInternal(region, input, 0),
    );
    const this_arg = atInternal(region, input, 1);
    const length = getLength(region, target);
    for (let index = 0; index < length; index++) {
      if (hasInternalProperty(region, target, index)) {
        if (
          !applyInternal(region, predicate, this_arg, [
            getInternalPropertyValue(region, target, index, target),
            wrapStandardPrimitive(region, index),
            target,
          ]).inner
        ) {
          return wrapStandardPrimitive(region, false);
        }
      }
    }
    return wrapStandardPrimitive(region, true);
  },
  "global.Array.prototype.fill": (region, that, input) => {
    const {
      "global.TypeError": TypeError,
      "global.Number": Number,
      "global.undefined": undefined,
    } = region;
    const target = toInternalReferenceSloppy(region, that);
    const length = getLength(region, target);
    const value = atInternal(region, input, 0);
    const index1 = max(
      0,
      incrementWhenNegative(
        toInteger(Number(atExternal(region, input, 1)), 0),
        length,
      ),
    );
    const argument2 = atExternal(region, input, 2);
    const index2 =
      argument2 === undefined
        ? length
        : min(
            length,
            incrementWhenNegative(toInteger(Number(argument2), 0), length),
          );
    for (let index = index1; index < index2; index++) {
      if (!setInternalPropertyValue(region, target, index, value, target)) {
        throw new TypeError("Cannot set array index at Array.prototype.fill");
      }
    }
    return target;
  },
  "global.Array.prototype.filter": (region, that, input) => {
    const { "global.TypeError": TypeError } = region;
    const target = toInternalReferenceSloppy(region, that);
    const predicate = toInternalClosureStrict(
      region,
      atInternal(region, input, 0),
    );
    const this_arg = atInternal(region, input, 1);
    const target_length = getLength(region, target);
    const result = createSpecieArray(region, target, 0);
    let arg_index = 0;
    let res_index = 0;
    while (arg_index < target_length) {
      if (hasInternalProperty(region, target, arg_index)) {
        const item = getInternalPropertyValue(
          region,
          target,
          arg_index,
          target,
        );
        if (
          applyInternal(region, predicate, this_arg, [
            item,
            wrapStandardPrimitive(region, arg_index),
            target,
          ]).inner
        ) {
          if (
            !defineInternalPropertyDescriptor(region, result, res_index, {
              __proto__: null,
              value: item,
              writable: true,
              enumerable: true,
              configurable: true,
            })
          ) {
            throw new TypeError(
              "Cannot define array index at Array.prototype.filter",
            );
          }
          res_index++;
        }
      }
      arg_index++;
    }
    if (
      !defineInternalPropertyDescriptor(region, result, "length", {
        __proto__: null,
        value: wrapStandardPrimitive(region, res_index),
        writable: true,
        enumerable: false,
        configurable: false,
      })
    ) {
      throw new TypeError(
        "Cannot define array length at Array.prototype.filter",
      );
    }
    return result;
  },
  "global.Array.prototype.find": (region, that, input) => {
    const { "global.undefined": undefined } = region;
    const target = toInternalReferenceSloppy(region, that);
    const predicate = toInternalClosureStrict(
      region,
      atInternal(region, input, 0),
    );
    const this_arg = atInternal(region, input, 1);
    const length = getLength(region, target);
    for (let index = 0; index < length; index++) {
      const value = getInternalPropertyValue(region, target, index, target);
      if (
        applyInternal(region, predicate, this_arg, [
          value,
          wrapStandardPrimitive(region, index),
          target,
        ]).inner
      ) {
        return value;
      }
    }
    return wrapStandardPrimitive(region, undefined);
  },
  "global.Array.prototype.findIndex": (region, that, input) => {
    const target = toInternalReferenceSloppy(region, that);
    const predicate = toInternalClosureStrict(
      region,
      atInternal(region, input, 0),
    );
    const this_arg = atInternal(region, input, 1);
    const length = getLength(region, target);
    for (let index = 0; index < length; index++) {
      if (
        applyInternal(region, predicate, this_arg, [
          getInternalPropertyValue(region, target, index, target),
          wrapStandardPrimitive(region, index),
          target,
        ]).inner
      ) {
        return wrapStandardPrimitive(region, index);
      }
    }
    return wrapStandardPrimitive(region, -1);
  },
  "global.Array.prototype.findLast": (region, that, input) => {
    const { "global.undefined": undefined } = region;
    const target = toInternalReferenceSloppy(region, that);
    const predicate = toInternalClosureStrict(
      region,
      atInternal(region, input, 0),
    );
    const this_arg = atInternal(region, input, 1);
    const length = getLength(region, target);
    for (let index = length - 1; index >= 0; index--) {
      const value = getInternalPropertyValue(region, target, index, target);
      if (
        applyInternal(region, predicate, this_arg, [
          value,
          wrapStandardPrimitive(region, index),
          target,
        ]).inner
      ) {
        return value;
      }
    }
    return wrapStandardPrimitive(region, undefined);
  },
  "global.Array.prototype.findLastIndex": (region, that, input) => {
    const target = toInternalReferenceSloppy(region, that);
    const predicate = toInternalClosureStrict(
      region,
      atInternal(region, input, 0),
    );
    const this_arg = atInternal(region, input, 1);
    const length = getLength(region, target);
    for (let index = length - 1; index >= 0; index--) {
      if (
        applyInternal(region, predicate, this_arg, [
          getInternalPropertyValue(region, target, index, target),
          wrapStandardPrimitive(region, index),
          target,
        ]).inner
      ) {
        return wrapStandardPrimitive(region, index);
      }
    }
    return wrapStandardPrimitive(region, -1);
  },
  "global.Array.prototype.flat": (region, that, input) => {
    const { "global.Number": Number } = region;
    const target = toInternalReferenceSloppy(region, that);
    const argument0 = atExternal(region, input, 0);
    const depth =
      argument0 == null ? 1 : max(0, toInteger(Number(argument0), 0));
    const result = createSpecieArray(region, target, 0);
    defineInternalPropertyDescriptor(region, result, "length", {
      __proto__: null,
      value: wrapStandardPrimitive(
        region,
        flatenArray(region, depth + 1, target, result, 0),
      ),
      writable: true,
      enumerable: false,
      configurable: false,
    });
    return result;
  },
  "global.Array.prototype.flatMap": (region, that, input) => {
    const { "global.TypeError": TypeError } = region;
    const target = toInternalReferenceSloppy(region, that);
    const transform = toInternalClosureStrict(
      region,
      atInternal(region, input, 0),
    );
    const this_arg = atInternal(region, input, 1);
    const target_length = getLength(region, target);
    const result = createSpecieArray(region, target, 0);
    let result_length = 0;
    for (let index = 0; index < target_length; index++) {
      if (hasInternalProperty(region, target, index)) {
        const item = applyInternal(region, transform, this_arg, [
          getInternalPropertyValue(region, target, index, target),
          wrapStandardPrimitive(region, index),
          target,
        ]);
        if (isInternalArray(region, item)) {
          const item_length = getLength(region, item);
          for (let index = 0; index < item_length; index++) {
            if (hasInternalProperty(region, item, index)) {
              if (
                !defineInternalPropertyDescriptor(
                  region,
                  result,
                  result_length,
                  {
                    __proto__: null,
                    value: getInternalPropertyValue(region, item, index, item),
                    writable: true,
                    enumerable: true,
                    configurable: true,
                  },
                )
              ) {
                throw new TypeError(
                  "Cannot define array index at Array.prototype.flatMap",
                );
              }
              result_length++;
            }
          }
        } else {
          if (
            !defineInternalPropertyDescriptor(region, result, result_length, {
              __proto__: null,
              value: item,
              writable: true,
              enumerable: true,
              configurable: true,
            })
          ) {
            throw new TypeError(
              "Cannot define array index at Array.prototype.map",
            );
          }
          result_length++;
        }
      }
    }
    return result;
  },
  "global.Array.prototype.forEach": (region, that, input) => {
    const { "global.undefined": undefined } = region;
    const target = toInternalReferenceSloppy(region, that);
    const callback = toInternalClosureStrict(
      region,
      atInternal(region, input, 0),
    );
    const this_arg = atInternal(region, input, 1);
    const length = getLength(region, target);
    for (let index = 0; index < length; index++) {
      if (hasInternalProperty(region, target, index)) {
        applyInternal(region, callback, this_arg, [
          getInternalPropertyValue(region, target, index, target),
          wrapStandardPrimitive(region, index),
          target,
        ]);
      }
    }
    return wrapStandardPrimitive(region, undefined);
  },
  "global.Array.prototype.includes": null, // no benefit
  "global.Array.prototype.indexOf": null, // no benefit
  "global.Array.prototype.join": null, // no benefit
  "global.Array.prototype.keys": null, // returns exotic array iterator object
  "global.Array.prototype.lastIndexOf": null, // no benefit
  "global.Array.prototype.length": null, // not a function
  "global.Array.prototype.map": (region, that, input) => {
    const { "global.TypeError": TypeError } = region;
    const target = toInternalReferenceSloppy(region, that);
    const transform = toInternalClosureStrict(
      region,
      atInternal(region, input, 0),
    );
    const this_arg = atInternal(region, input, 1);
    const target_length = getLength(region, target);
    const result = createSpecieArray(region, target, target_length);
    for (let index = 0; index < target_length; index++) {
      if (hasInternalProperty(region, target, index)) {
        if (
          !defineInternalPropertyDescriptor(region, result, index, {
            __proto__: null,
            value: applyInternal(region, transform, this_arg, [
              getInternalPropertyValue(region, target, index, target),
              wrapStandardPrimitive(region, index),
              target,
            ]),
            writable: true,
            enumerable: true,
            configurable: true,
          })
        ) {
          throw new TypeError(
            "Cannot define array index at Array.prototype.map",
          );
        }
      }
    }
    return result;
  },
  "global.Array.prototype.pop": (region, that, _input) => {
    const { "global.undefined": undefined, "global.TypeError": TypeError } =
      region;
    const target = toInternalReferenceSloppy(region, that);
    const length = getLength(region, target);
    if (length === 0) {
      if (
        !setInternalPropertyValue(
          region,
          target,
          "length",
          wrapStandardPrimitive(region, 0),
          target,
        )
      ) {
        throw new TypeError("Cannot set array length at Array.prototype.pop");
      }
      return wrapStandardPrimitive(region, undefined);
    } else {
      const value = getInternalPropertyValue(
        region,
        target,
        length - 1,
        target,
      );
      if (!deleteInternalOwnProperty(region, target, length - 1)) {
        throw new TypeError("Cannot delete array index at Array.prototype.pop");
      }
      if (
        !setInternalPropertyValue(
          region,
          target,
          "length",
          wrapStandardPrimitive(region, length - 1),
          target,
        )
      ) {
        throw new TypeError("Cannot set array length at Array.prototype.pop");
      }
      return value;
    }
  },
  "global.Array.prototype.push": (region, that, input) => {
    const {
      "global.TypeError": TypeError,
      "global.Number.MAX_SAFE_INTEGER": MAX_SAFE_INTEGER,
    } = region;
    const target = toInternalReferenceSloppy(region, that);
    const length = getLength(region, target);
    for (let index = 0; index < input.length; index++) {
      if (length >= MAX_SAFE_INTEGER - index) {
        throw new TypeError(
          "Array length exceeds maximum safe integer at Array.prototype.push",
        );
      }
      if (
        !setInternalPropertyValue(
          region,
          target,
          length + index,
          input[index],
          target,
        )
      ) {
        throw new TypeError("Cannot set array index at Array.prototype.push");
      }
    }
    if (
      !setInternalPropertyValue(
        region,
        target,
        "length",
        wrapStandardPrimitive(region, length + input.length),
        target,
      )
    ) {
      throw new TypeError("Cannot set array length at Array.prototype.push");
    }
    return wrapStandardPrimitive(region, length + input.length);
  },
  "global.Array.prototype.reduce": (region, that, input) => {
    const { "global.TypeError": TypeError } = region;
    const target = toInternalReferenceSloppy(region, that);
    const accumulate = toInternalClosureStrict(
      region,
      atInternal(region, input, 0),
    );
    const initial_value = atInternal(region, input, 1);
    const this_arg = atInternal(region, input, 2);
    const length = getLength(region, target);
    let initialized = input.length > 1;
    let accumulation = initial_value;
    for (let index = 0; index < length; index++) {
      if (hasInternalProperty(region, target, index)) {
        const item = getInternalPropertyValue(region, target, index, target);
        if (!initialized) {
          accumulation = item;
          initialized = true;
        } else {
          accumulation = applyInternal(region, accumulate, this_arg, [
            accumulation,
            item,
            wrapStandardPrimitive(region, index),
            target,
          ]);
        }
      }
    }
    if (!initialized) {
      throw new TypeError("Missing initial value at Array.prototype.reduce");
    }
    return accumulation;
  },
  "global.Array.prototype.reduceRight": (region, that, input) => {
    const { "global.TypeError": TypeError } = region;
    const target = toInternalReferenceSloppy(region, that);
    const accumulate = toInternalClosureStrict(
      region,
      atInternal(region, input, 0),
    );
    const initial_value = atInternal(region, input, 1);
    const this_arg = atInternal(region, input, 2);
    const length = getLength(region, target);
    let initialized = input.length > 1;
    let accumulation = initial_value;
    for (let index = length - 1; index >= 0; index--) {
      if (hasInternalProperty(region, target, index)) {
        const item = getInternalPropertyValue(region, target, index, target);
        if (!initialized) {
          accumulation = item;
          initialized = true;
        } else {
          accumulation = applyInternal(region, accumulate, this_arg, [
            accumulation,
            item,
            wrapStandardPrimitive(region, index),
            target,
          ]);
        }
      }
    }
    if (!initialized) {
      throw new TypeError("Missing initial value at Array.prototype.reduce");
    }
    return accumulation;
  },
  "global.Array.prototype.reverse": (region, that, _input) => {
    const { "global.TypeError": TypeError } = region;
    const target = toInternalReferenceSloppy(region, that);
    const length = getLength(region, target);
    const middle = floor(length / 2);
    for (let index = 0; index < middle; index++) {
      const lower_index = index;
      const upper_index = length - index - 1;
      const lower_value = hasInternalProperty(region, target, lower_index)
        ? {
            inner: getInternalPropertyValue(
              region,
              target,
              lower_index,
              target,
            ),
          }
        : {};
      const upper_value = hasInternalProperty(region, target, upper_index)
        ? {
            inner: getInternalPropertyValue(
              region,
              target,
              upper_index,
              target,
            ),
          }
        : {};
      if (hasOwnNarrow(upper_value, "inner")) {
        if (
          !setInternalPropertyValue(
            region,
            target,
            lower_index,
            upper_value.inner,
            target,
          )
        ) {
          throw new TypeError(
            "Cannot set array index at Array.prototype.reverse",
          );
        }
      } else {
        if (!deleteInternalOwnProperty(region, target, lower_index)) {
          throw new TypeError(
            "Cannot delete array index at Array.prototype.reverse",
          );
        }
      }
      if (hasOwnNarrow(lower_value, "inner")) {
        if (
          !setInternalPropertyValue(
            region,
            target,
            upper_index,
            lower_value.inner,
            target,
          )
        ) {
          throw new TypeError(
            "Cannot set array index at Array.prototype.reverse",
          );
        }
      } else {
        if (!deleteInternalOwnProperty(region, target, upper_index)) {
          throw new TypeError(
            "Cannot delete array index at Array.prototype.reverse",
          );
        }
      }
    }
    return target;
  },
  "global.Array.prototype.shift": (region, that, _input) => {
    const { "global.undefined": undefined, "global.TypeError": TypeError } =
      region;
    const target = toInternalReferenceSloppy(region, that);
    const length = getLength(region, target);
    if (length === 0) {
      if (
        !setInternalPropertyValue(
          region,
          target,
          "length",
          wrapStandardPrimitive(region, 0),
          target,
        )
      ) {
        throw new TypeError("Cannot set array length at Array.prototype.shift");
      }
      return wrapStandardPrimitive(region, undefined);
    }
    const initial = getInternalPropertyValue(region, target, 0, target);
    for (let index = 0; index < length; index++) {
      if (hasInternalProperty(region, target, index + 1)) {
        if (
          !setInternalPropertyValue(
            region,
            target,
            index,
            getInternalPropertyValue(region, target, index + 1, target),
            target,
          )
        ) {
          throw new TypeError(
            "Cannot set array index at Array.prototype.shift",
          );
        }
      } else {
        if (!deleteInternalOwnProperty(region, target, index)) {
          throw new TypeError(
            "Cannot delete array index at Array.prototype.shift",
          );
        }
      }
    }
    if (
      !setInternalPropertyValue(
        region,
        target,
        "length",
        wrapStandardPrimitive(region, length - 1),
        target,
      )
    ) {
      throw new TypeError(
        "Cannot define array length at Array.prototype.shift",
      );
    }
    return initial;
  },
  "global.Array.prototype.slice": (region, that, input) => {
    const {
      "global.TypeError": TypeError,
      "global.Number": Number,
      "global.undefined": undefined,
    } = region;
    const target = toInternalReferenceSloppy(region, that);
    const target_length = getLength(region, target);
    const index1 = max(
      0,
      incrementWhenNegative(
        toInteger(Number(atExternal(region, input, 0)), 0),
        target_length,
      ),
    );
    const argument1 = atExternal(region, input, 1);
    const index2 =
      argument1 === undefined
        ? target_length
        : min(
            target_length,
            incrementWhenNegative(
              toInteger(Number(atExternal(region, input, 1)), 0),
              target_length,
            ),
          );
    const result = createSpecieArray(region, target, max(index2 - index1, 0));
    for (let index = index1; index < index2; index++) {
      if (
        !defineInternalPropertyDescriptor(region, result, index - index1, {
          __proto__: null,
          value: getInternalPropertyValue(region, target, index, target),
          writable: true,
          enumerable: true,
          configurable: true,
        })
      ) {
        throw new TypeError(
          "Cannot define array index at Array.prototype.slice",
        );
      }
    }
    return result;
  },
  "global.Array.prototype.some": (region, that, input) => {
    const target = toInternalReferenceSloppy(region, that);
    const predicate = toInternalClosureStrict(
      region,
      atInternal(region, input, 0),
    );
    const this_arg = atInternal(region, input, 1);
    const length = getLength(region, target);
    for (let index = 0; index < length; index++) {
      if (hasInternalProperty(region, target, index)) {
        if (
          applyInternal(region, predicate, this_arg, [
            getInternalPropertyValue(region, target, index, target),
            wrapStandardPrimitive(region, index),
            target,
          ]).inner
        ) {
          return wrapStandardPrimitive(region, true);
        }
      }
    }
    return wrapStandardPrimitive(region, false);
  },
  "global.Array.prototype.sort": (region, that, input) => {
    const { "global.undefined": undefined, "global.TypeError": TypeError } =
      region;
    const target = toInternalReferenceSloppy(region, that);
    const target_length = getLength(region, target);
    const argument0 = atInternal(region, input, 0);
    let compare = null;
    if (argument0.type === "primitive") {
      if (argument0.inner !== undefined) {
        throw new TypeError("Invalid compare function at Array.prototype.sort");
      }
    } else {
      if (typeof argument0.inner !== "function") {
        throw new TypeError("Invalid compare function at Array.prototype.sort");
      }
      compare = argument0;
    }
    const copy = sortInternalValueArray(
      region,
      target,
      target_length,
      compare,
      "skip",
    );
    const copy_length = copy.length;
    for (let index = 0; index < target_length; index++) {
      if (index < copy_length) {
        if (
          !setInternalPropertyValue(region, target, index, copy[index], target)
        ) {
          throw new TypeError("Cannot set array index at Array.prototype.sort");
        }
      } else {
        if (!deleteInternalOwnProperty(region, target, index)) {
          throw new TypeError(
            "Cannot delete array index at Array.prototype.sort",
          );
        }
      }
    }
    return target;
  },
  "global.Array.prototype.splice": (region, that, input) => {
    const {
      "global.Number": Number,
      "global.TypeError": TypeError,
      "global.Number.MAX_SAFE_INTEGER": MAX_SAFE_INTEGER,
    } = region;
    const target = toInternalReferenceSloppy(region, that);
    const target_length = getLength(region, target);
    const start_index = clamp(
      incrementWhenNegative(
        toInteger(Number(atExternal(region, input, 0)), 0),
        target_length,
      ),
      0,
      target_length,
    );
    const delete_count =
      input.length === 1
        ? target_length - start_index
        : clamp(
            toInteger(Number(atExternal(region, input, 1)), 0),
            0,
            target_length - start_index,
          );
    const item_count = max(0, input.length - 2);
    if (target_length + item_count - delete_count > MAX_SAFE_INTEGER) {
      throw new TypeError(
        "Array length exceeds maximum safe integer at Array.prototype.splice",
      );
    }
    const result = createSpecieArray(region, target, delete_count);
    for (let result_index = 0; result_index < delete_count; result_index++) {
      const target_index = start_index + result_index;
      if (hasInternalProperty(region, target, target_index)) {
        if (
          !defineInternalPropertyDescriptor(region, result, result_index, {
            __proto__: null,
            value: getInternalPropertyValue(
              region,
              target,
              target_index,
              target,
            ),
            writable: true,
            enumerable: true,
            configurable: true,
          })
        ) {
          throw new TypeError(
            "Cannot define array index at Array.prototype.splice",
          );
        }
      }
    }
    if (
      !setInternalPropertyValue(
        region,
        result,
        "length",
        wrapStandardPrimitive(region, delete_count),
        result,
      )
    ) {
      throw new TypeError("Cannot set array length at Array.prototype.splice");
    }
    if (item_count < delete_count) {
      for (
        let index = start_index;
        index < target_length - delete_count;
        index++
      ) {
        if (hasInternalProperty(region, target, index + delete_count)) {
          if (
            !setInternalPropertyValue(
              region,
              target,
              index + item_count,
              getInternalPropertyValue(
                region,
                target,
                index + delete_count,
                target,
              ),
              target,
            )
          ) {
            throw new TypeError(
              "Cannot set array index at Array.prototype.splice",
            );
          }
        } else {
          if (!deleteInternalOwnProperty(region, target, index + item_count)) {
            throw new TypeError(
              "Cannot delete array index at Array.prototype.splice",
            );
          }
        }
      }
      for (
        let index = target_length;
        index > target_length - delete_count + item_count;
        index--
      ) {
        if (!deleteInternalOwnProperty(region, target, index - 1)) {
          throw new TypeError(
            "Cannot delete array index at Array.prototype.splice",
          );
        }
      }
    }
    if (item_count > delete_count) {
      for (
        let index = target_length - delete_count;
        index > start_index;
        index--
      ) {
        if (hasInternalProperty(region, target, index + delete_count - 1)) {
          if (
            !setInternalPropertyValue(
              region,
              target,
              index + item_count - 1,
              getInternalPropertyValue(
                region,
                target,
                index + delete_count - 1,
                target,
              ),
              target,
            )
          ) {
            throw new TypeError(
              "Cannot set array index at Array.prototype.splice",
            );
          }
        } else {
          if (
            !deleteInternalOwnProperty(region, target, index + item_count - 1)
          ) {
            throw new TypeError(
              "Cannot delete array index at Array.prototype.splice",
            );
          }
        }
      }
    }
    for (let index = 0; index < item_count; index++) {
      if (
        !setInternalPropertyValue(
          region,
          target,
          start_index + index,
          input[index + 2],
          target,
        )
      ) {
        throw new TypeError("Cannot set array index at Array.prototype.splice");
      }
    }
    if (
      !setInternalPropertyValue(
        region,
        target,
        "length",
        wrapStandardPrimitive(
          region,
          target_length - delete_count + item_count,
        ),
        target,
      )
    ) {
      throw new TypeError("Cannot set array length at Array.prototype.splice");
    }
    return result;
  },
  "global.Array.prototype.toLocaleString": null, // no benefit
  "global.Array.prototype.toReversed": (region, that, _input) => {
    const { "global.TypeError": TypeError } = region;
    const target = toInternalReferenceSloppy(region, that);
    const target_length = getLength(region, target);
    const result = createEmptyArray(region, 0);
    for (let index = 0; index < target_length; index++) {
      if (
        !defineInternalPropertyDescriptor(region, result, index, {
          __proto__: null,
          value: getInternalPropertyValue(
            region,
            target,
            target_length - index - 1,
            target,
          ),
          writable: true,
          enumerable: true,
          configurable: true,
        })
      ) {
        throw new TypeError(
          "Cannot define array index at Array.prototype.toReversed",
        );
      }
    }
    return result;
  },
  "global.Array.prototype.toSorted": (region, that, input) => {
    const { "global.undefined": undefined, "global.TypeError": TypeError } =
      region;
    const target = toInternalReferenceSloppy(region, that);
    const target_length = getLength(region, target);
    const argument0 = atInternal(region, input, 0);
    let compare = null;
    if (argument0.type === "primitive") {
      if (argument0.inner !== undefined) {
        throw new TypeError("Invalid compare function at Array.prototype.sort");
      }
    } else {
      if (typeof argument0.inner !== "function") {
        throw new TypeError("Invalid compare function at Array.prototype.sort");
      }
      compare = argument0;
    }
    return createFullArray(
      region,
      sortInternalValueArray(region, target, target_length, compare, "read"),
    );
  },
  "global.Array.prototype.toSpliced": (region, that, input) => {
    const {
      "global.Number": Number,
      "global.TypeError": TypeError,
      "global.Reflect.defineProperty": defineProperty,
    } = region;
    const target = toInternalReferenceSloppy(region, that);
    const target_length = getLength(region, target);
    const start_index = clamp(
      incrementWhenNegative(
        toInteger(Number(atExternal(region, input, 0)), 0),
        target_length,
      ),
      0,
      target_length,
    );
    const delete_count =
      input.length === 1
        ? target_length - start_index
        : clamp(
            toInteger(Number(atExternal(region, input, 1)), 0),
            0,
            target_length - start_index,
          );
    const item_count = max(0, input.length - 2);
    const result = createEmptyArray(
      region,
      target_length - delete_count + item_count,
    );
    for (let index = 0; index < start_index; index++) {
      if (
        !defineProperty(result.plain, index, {
          __proto__: null,
          value: getInternalPropertyValue(region, target, index, target),
          writable: true,
          enumerable: true,
          configurable: true,
        })
      ) {
        throw new TypeError(
          "Cannot define array index at Array.prototype.toSpliced",
        );
      }
    }
    for (let index = start_index; index < start_index + item_count; index++) {
      if (
        !defineProperty(result.plain, index, {
          __proto__: null,
          value: atInternal(region, input, index + 2 - start_index),
          writable: true,
          enumerable: true,
          configurable: true,
        })
      ) {
        throw new TypeError(
          "Cannot define array index at Array.prototype.toSpliced",
        );
      }
    }
    for (
      let index = start_index + item_count;
      index < target_length + item_count - delete_count;
      index++
    ) {
      if (
        !defineProperty(result.plain, index, {
          __proto__: null,
          value: getInternalPropertyValue(
            region,
            target,
            index + delete_count - item_count,
            target,
          ),
          writable: true,
          enumerable: true,
          configurable: true,
        })
      ) {
        throw new TypeError(
          "Cannot define array index at Array.prototype.toSpliced",
        );
      }
    }
    return result;
  },
  "global.Array.prototype.toString": null, // no benefit
  "global.Array.prototype.unshift": (region, that, input) => {
    const {
      "global.TypeError": TypeError,
      "global.Number.MAX_SAFE_INTEGER": MAX_SAFE_INTEGER,
    } = region;
    const target = toInternalReferenceSloppy(region, that);
    const target_length = getLength(region, target);
    const input_length = input.length;
    const new_length = target_length + input_length;
    if (new_length >= MAX_SAFE_INTEGER) {
      throw new TypeError(
        "Array length exceeds maximum safe integer at Array.prototype.unshift",
      );
    }
    for (let index = target_length - 1; index >= 0; index--) {
      if (hasInternalProperty(region, target, index)) {
        if (
          !setInternalPropertyValue(
            region,
            target,
            index + input.length,
            getInternalPropertyValue(region, target, index, target),
            target,
          )
        ) {
          throw new TypeError(
            "Cannot set array index at Array.prototype.unshift",
          );
        }
      } else {
        if (!deleteInternalOwnProperty(region, target, index + input_length)) {
          throw new TypeError(
            "Cannot delete array index at Array.prototype.unshift",
          );
        }
      }
    }
    for (let index = 0; index < input_length; index++) {
      if (
        !setInternalPropertyValue(region, target, index, input[index], target)
      ) {
        throw new TypeError(
          "Cannot set array index at Array.prototype.unshift",
        );
      }
    }
    if (
      !setInternalPropertyValue(
        region,
        target,
        "length",
        wrapStandardPrimitive(region, new_length),
        target,
      )
    ) {
      throw new TypeError("Cannot set array length at Array.prototype.unshift");
    }
    return wrapStandardPrimitive(region, new_length);
  },
  "global.Array.prototype.values": null, // returns exotic array iterator object
  "global.Array.prototype.with": (region, that, input) => {
    const {
      "global.Number": Number,
      "global.RangeError": RangeError,
      "global.TypeError": TypeError,
    } = region;
    const target = toInternalReferenceSloppy(region, that);
    const length = getLength(region, target);
    const match = incrementWhenNegative(
      toInteger(Number(atExternal(region, input, 0)), 0),
      length,
    );
    const item = atInternal(region, input, 1);
    if (match < 0 || match >= length) {
      throw new RangeError("Array index out of range at Array.prototype.with");
    }
    const result = createEmptyArray(region, length);
    for (let index = 0; index < length; index++) {
      if (
        !setInternalPropertyValue(
          region,
          result,
          index,
          index === match
            ? item
            : getInternalPropertyValue(region, target, index, target),
          result,
        )
      ) {
        throw new TypeError("Cannot set array index at Array.prototype.with");
      }
    }
    return result;
  },
  // global.Array.prototype[@@iterator] >> returns exotic array iterator object
};
