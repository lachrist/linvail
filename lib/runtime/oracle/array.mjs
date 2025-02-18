import { clamp, incrementWhenNegative, toInteger } from "../../util/number.mjs";
import { hasOwnNarrow } from "../../util/record.mjs";
import {
  atExternal,
  atInternal,
  createSpecieArray,
  toBoolean,
  toInternalClosureSloppy,
  toInternalClosureStrict,
  toInternalReferenceSloppy,
  toInternalReferenceStrict,
  createArray,
  fromInternalValueArray,
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
  enterPlainExternalReference,
  enterPlainInternalArrayWithExternalPrototype,
  enterPrimitive,
  isInternalPrimitive,
  leavePrimitive,
} from "../region/core.mjs";
import { leaveReference } from "../region/util.mjs";

const {
  Math: { max, min, floor },
} = globalThis;

/** @type {import("../oracle").ConstructOracleMapping} */
export const array_construct_oracle_mapping = {
  "global.Array": (region, input, new_target) => {
    const {
      "global.Reflect.apply": apply,
      "global.Array": Array,
      "global.RangeError": RangeError,
      "global.Array.of": toArray,
      "global.Array.prototype": array_prototype,
    } = region;
    const argument0 = atExternal(region, input, 0);
    let result;
    if (input.length === 1 && typeof argument0 === "number") {
      const length = toInteger(argument0, 0);
      if (argument0 !== length) {
        throw new RangeError("Invalid array length at Array");
      }
      result = new Array(length);
    } else {
      result = apply(toArray, null, input);
    }
    const prototype = getInternalPropertyValue(
      region,
      new_target,
      "prototype",
      new_target,
    );
    return enterPlainInternalArrayWithExternalPrototype(
      region,
      result,
      isInternalPrimitive(region, prototype)
        ? /* BREAKAGE: we should use array_prototype from new_target's realm */
          enterPlainExternalReference(region, array_prototype)
        : prototype,
    );
  },
};

/** @type {import("../oracle").ApplyOracleMapping} */
export const array_apply_oracle_mapping = {
  "global.Array": (region, _that, input) => {
    const { "global.RangeError": RangeError } = region;
    const argument0 = atExternal(region, input, 0);
    if (input.length === 1 && typeof argument0 === "number") {
      const length = toInteger(argument0, 0);
      if (argument0 !== length) {
        throw new RangeError("Invalid array length at Array");
      }
      return createArray(region, length);
    } else {
      return fromInternalValueArray(region, input);
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
    if (isInternalPrimitive(region, generate)) {
      if (leavePrimitive(region, generate) == null) {
        return convertArrayLike(region, target, transform, this_arg);
      } else {
        throw new TypeError("@@iterator is not a function at Array.from");
      }
    } else {
      if (is(leaveReference(region, generate), array_iterator)) {
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
  // global.Array.fromAsync >> TODO
  // global.Array.isArray >> no benefit
  "global.Array.of": (region, _that, input) =>
    fromInternalValueArray(region, input),
  "global.Array.prototype.at": (region, that, input) => {
    const { "global.undefined": undefined, "global.Number": Number } = region;
    const target = toInternalReferenceSloppy(region, that);
    const length = getLength(region, target);
    const index = incrementWhenNegative(
      toInteger(Number(atExternal(region, input, 0)), 0),
      length,
    );
    if (index < 0 || index >= length) {
      return enterPrimitive(region, undefined);
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
        !isInternalPrimitive(region, current) &&
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
                value: enterPrimitive(region, result_length + 1),
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
  // global.Array.prototype.entries >> returns exotic array iterator object
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
          !toBoolean(
            region,
            applyInternal(region, predicate, this_arg, [
              getInternalPropertyValue(region, target, index, target),
              enterPrimitive(region, index),
              target,
            ]),
          )
        ) {
          return enterPrimitive(region, false);
        }
      }
    }
    return enterPrimitive(region, true);
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
          toBoolean(
            region,
            applyInternal(region, predicate, this_arg, [
              item,
              enterPrimitive(region, arg_index),
              target,
            ]),
          )
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
        value: enterPrimitive(region, res_index),
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
        toBoolean(
          region,
          applyInternal(region, predicate, this_arg, [
            value,
            enterPrimitive(region, index),
            target,
          ]),
        )
      ) {
        return value;
      }
    }
    return enterPrimitive(region, undefined);
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
        toBoolean(
          region,
          applyInternal(region, predicate, this_arg, [
            getInternalPropertyValue(region, target, index, target),
            enterPrimitive(region, index),
            target,
          ]),
        )
      ) {
        return enterPrimitive(region, index);
      }
    }
    return enterPrimitive(region, -1);
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
        toBoolean(
          region,
          applyInternal(region, predicate, this_arg, [
            value,
            enterPrimitive(region, index),
            target,
          ]),
        )
      ) {
        return value;
      }
    }
    return enterPrimitive(region, undefined);
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
        toBoolean(
          region,
          applyInternal(region, predicate, this_arg, [
            getInternalPropertyValue(region, target, index, target),
            enterPrimitive(region, index),
            target,
          ]),
        )
      ) {
        return enterPrimitive(region, index);
      }
    }
    return enterPrimitive(region, -1);
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
      value: enterPrimitive(
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
          enterPrimitive(region, index),
          target,
        ]);
        if (
          !isInternalPrimitive(region, item) &&
          isInternalArray(region, item)
        ) {
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
              value: applyInternal(region, transform, this_arg, [
                getInternalPropertyValue(region, target, index, target),
                enterPrimitive(region, index),
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
          enterPrimitive(region, index),
          target,
        ]);
      }
    }
    return enterPrimitive(region, undefined);
  },
  // global.Array.prototype.includes >> no benefit
  // global.Array.prototype.indexOf >> no benefit
  // global.Array.prototype.join >> no benefit
  // global.Array.prototype.keys >> returns exotic array iterator object
  // global.Array.prototype.lastIndexOf >> no benefit
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
              enterPrimitive(region, index),
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
          enterPrimitive(region, 0),
          target,
        )
      ) {
        throw new TypeError("Cannot set array length at Array.prototype.pop");
      }
      return enterPrimitive(region, undefined);
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
          enterPrimitive(region, length - 1),
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
        enterPrimitive(region, length + input.length),
        target,
      )
    ) {
      throw new TypeError("Cannot set array length at Array.prototype.push");
    }
    return enterPrimitive(region, length + input.length);
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
            enterPrimitive(region, index),
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
            enterPrimitive(region, index),
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
          enterPrimitive(region, 0),
          target,
        )
      ) {
        throw new TypeError("Cannot set array length at Array.prototype.shift");
      }
      return enterPrimitive(region, undefined);
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
        enterPrimitive(region, length - 1),
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
          toBoolean(
            region,
            applyInternal(region, predicate, this_arg, [
              getInternalPropertyValue(region, target, index, target),
              enterPrimitive(region, index),
              target,
            ]),
          )
        ) {
          return enterPrimitive(region, true);
        }
      }
    }
    return enterPrimitive(region, false);
  },
  "global.Array.prototype.sort": (region, that, input) => {
    const { "global.undefined": undefined, "global.TypeError": TypeError } =
      region;
    const target = toInternalReferenceSloppy(region, that);
    const target_length = getLength(region, target);
    const argument0 = atInternal(region, input, 0);
    let compare = null;
    if (isInternalPrimitive(region, argument0)) {
      if (leavePrimitive(region, argument0) !== undefined) {
        throw new TypeError("Invalid compare function at Array.prototype.sort");
      }
    } else {
      if (typeof leaveReference(region, argument0) !== "function") {
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
        enterPrimitive(region, delete_count),
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
        enterPrimitive(region, target_length - delete_count + item_count),
        target,
      )
    ) {
      throw new TypeError("Cannot set array length at Array.prototype.splice");
    }
    return result;
  },
  // global.Array.prototype.toLocaleString >> no benefit
  "global.Array.prototype.toReversed": (region, that, _input) => {
    const { "global.TypeError": TypeError } = region;
    const target = toInternalReferenceSloppy(region, that);
    const target_length = getLength(region, target);
    const result = createArray(region, 0);
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
    if (isInternalPrimitive(region, argument0)) {
      if (leavePrimitive(region, argument0) !== undefined) {
        throw new TypeError("Invalid compare function at Array.prototype.sort");
      }
    } else {
      if (typeof leaveReference(region, argument0) !== "function") {
        throw new TypeError("Invalid compare function at Array.prototype.sort");
      }
      compare = argument0;
    }
    return fromInternalValueArray(
      region,
      sortInternalValueArray(region, target, target_length, compare, "read"),
    );
  },
  // "global.Array.prototype.toSpliced": (region, that, input) => {
  //   const { "global.Number": Number } = region;
  //   const target = toInternalReferenceSloppy(region, that);
  //   const target_length = getLength(region, target);
  //   const start_index = clamp(
  //     incrementWhenNegative(
  //       toInteger(Number(atExternal(region, input, 0)), 0),
  //       target_length,
  //     ),
  //     0,
  //     target_length,
  //   );
  //   const delete_count =
  //     input.length === 1
  //       ? target_length - start_index
  //       : clamp(
  //           toInteger(Number(atExternal(region, input, 1)), 0),
  //           0,
  //           target_length - start_index,
  //         );
  //   const item_count = max(0, input.length - 2);
  // },
  // global.Array.prototype.toString >> no benefit
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
        enterPrimitive(region, new_length),
        target,
      )
    ) {
      throw new TypeError("Cannot set array length at Array.prototype.unshift");
    }
    return enterPrimitive(region, new_length);
  },
  // global.Array.prototype.values >> returns exotic array iterator object
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
    const result = createArray(region, length);
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
