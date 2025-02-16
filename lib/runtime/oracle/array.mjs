import { hasOwnNarrow } from "../../util/record.mjs";
import {
  atExternal,
  atInternal,
  createSpecieArray,
  clampPositiveInteger,
  toBoolean,
  toInternalClosureSloppy,
  toInternalClosureStrict,
  toInternalReferenceSloppy,
  toInternalReferenceStrict,
  clampInteger,
  closeIterator,
  createArray,
  createFullArray,
  isConcatSpreadable,
} from "../convert.mjs";
import {
  applyInternal,
  defineInternalPropertyDescriptor,
  deleteInternalOwnProperty,
  getInternalPropertyValue,
  hasInternalProperty,
  setInternalPropertyValue,
} from "../reflect.mjs";
import {
  enterPrimitive,
  isInternalPrimitive,
  leavePrimitive,
} from "../region/core.mjs";
import { leaveReference, leaveValue } from "../region/util.mjs";

/**
 * @type {(
 *   region: import("../region/region").Region,
 *   target: import("../domain").InternalReference,
 *   transform: null | import("../domain").InternalReference,
 *   this_arg: import("../domain").InternalValue,
 * ) => import("../domain").PlainInternalArray}
 */
const convertArrayLike = (region, target, transform, this_arg) => {
  const { "global.Reflect.defineProperty": defineProperty } = region;
  const initial_length = clampPositiveInteger(
    region,
    leaveValue(
      region,
      getInternalPropertyValue(region, target, "length", target),
    ),
  );
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
    length = clampPositiveInteger(
      region,
      leaveValue(
        region,
        getInternalPropertyValue(region, target, "length", target),
      ),
    );
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
 *   region: import("../region/region").Region,
 *   iterator: import("../domain").InternalReference,
 *   transform: null | import("../domain").InternalReference,
 *   this_arg: import("../domain").InternalValue,
 * ) => import("../domain").PlainInternalArray}
 */
const convertIterator = (region, iterator, transform, this_arg) => {
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

/** @type {import("../oracle").ApplyOracleMapping} */
export const array_apply_oracle_mapping = {
  "global.Array.of": (region, _that, input) => createFullArray(region, input),
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
      if (
        is(
          leaveReference(region, generate),
          /** @type {import("../domain").ExternalReference} */ (
            /** @type {unknown}*/ (array_iterator)
          ),
        )
      ) {
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
  "global.Array.prototype.at": (region, that, input) => {
    const { "global.undefined": undefined } = region;
    const target = toInternalReferenceSloppy(region, that);
    let index = clampInteger(region, atExternal(region, input, 0));
    const length = clampPositiveInteger(
      region,
      leaveValue(
        region,
        getInternalPropertyValue(region, target, "length", target),
      ),
    );
    if (index < 0) {
      index += length;
    }
    if (index < 0 || index >= length) {
      return enterPrimitive(region, undefined);
    } else {
      return getInternalPropertyValue(region, target, index, target);
    }
  },
  "global.Array.prototype.filter": (region, that, input) => {
    const { "global.TypeError": TypeError } = region;
    const target = toInternalReferenceSloppy(region, that);
    const predicate = toInternalClosureStrict(
      region,
      atInternal(region, input, 0),
    );
    const this_arg = atInternal(region, input, 1);
    const length = clampPositiveInteger(
      region,
      leaveValue(
        region,
        getInternalPropertyValue(region, target, "length", target),
      ),
    );
    const array = createSpecieArray(region, target, 0);
    let arg_index = 0;
    let res_index = 0;
    while (arg_index < length) {
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
            !defineInternalPropertyDescriptor(region, array, res_index, {
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
      !defineInternalPropertyDescriptor(region, array, "length", {
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
    return array;
  },
  "global.Array.prototype.find": (region, that, input) => {
    const { "global.undefined": undefined } = region;
    const target = toInternalReferenceSloppy(region, that);
    const predicate = toInternalClosureStrict(
      region,
      atInternal(region, input, 0),
    );
    const this_arg = atInternal(region, input, 1);
    const length = clampPositiveInteger(
      region,
      leaveValue(
        region,
        getInternalPropertyValue(region, target, "length", target),
      ),
    );
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
  "global.Array.prototype.forEach": (region, that, input) => {
    const { "global.undefined": undefined } = region;
    const target = toInternalReferenceSloppy(region, that);
    const callback = toInternalClosureStrict(
      region,
      atInternal(region, input, 0),
    );
    const this_arg = atInternal(region, input, 1);
    const length = clampPositiveInteger(
      region,
      leaveValue(
        region,
        getInternalPropertyValue(region, target, "length", target),
      ),
    );
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
  "global.Array.prototype.map": (region, that, input) => {
    const { "global.TypeError": TypeError } = region;
    const target = toInternalReferenceSloppy(region, that);
    const transform = toInternalClosureStrict(
      region,
      atInternal(region, input, 0),
    );
    const this_arg = atInternal(region, input, 1);
    const length = clampPositiveInteger(
      region,
      leaveValue(
        region,
        getInternalPropertyValue(region, target, "length", target),
      ),
    );
    const array = createSpecieArray(region, target, length);
    for (let index = 0; index < length; index++) {
      if (hasInternalProperty(region, target, index)) {
        if (
          !defineInternalPropertyDescriptor(region, array, index, {
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
    return array;
  },
  "global.Array.prototype.pop": (region, that, _input) => {
    const { "global.undefined": undefined, "global.TypeError": TypeError } =
      region;
    const target = toInternalReferenceSloppy(region, that);
    const length = clampPositiveInteger(
      region,
      leaveValue(
        region,
        getInternalPropertyValue(region, target, "length", target),
      ),
    );
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
    const length = clampPositiveInteger(
      region,
      leaveValue(
        region,
        getInternalPropertyValue(region, target, "length", target),
      ),
    );
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
    const length = clampPositiveInteger(
      region,
      leaveValue(
        region,
        getInternalPropertyValue(region, target, "length", target),
      ),
    );
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
    const length = clampPositiveInteger(
      region,
      leaveValue(
        region,
        getInternalPropertyValue(region, target, "length", target),
      ),
    );
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
  "global.Array.prototype.some": (region, that, input) => {
    const target = toInternalReferenceSloppy(region, that);
    const predicate = toInternalClosureStrict(
      region,
      atInternal(region, input, 0),
    );
    const this_arg = atInternal(region, input, 1);
    const length = clampPositiveInteger(
      region,
      leaveValue(
        region,
        getInternalPropertyValue(region, target, "length", target),
      ),
    );
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
  "global.Array.prototype.every": (region, that, input) => {
    const target = toInternalReferenceSloppy(region, that);
    const predicate = toInternalClosureStrict(
      region,
      atInternal(region, input, 0),
    );
    const this_arg = atInternal(region, input, 1);
    const length = clampPositiveInteger(
      region,
      leaveValue(
        region,
        getInternalPropertyValue(region, target, "length", target),
      ),
    );
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
  "global.Array.prototype.reverse": (region, that, _input) => {
    const { "global.Math.floor": floor, "global.TypeError": TypeError } =
      region;
    const target = toInternalReferenceSloppy(region, that);
    const length = clampPositiveInteger(
      region,
      leaveValue(
        region,
        getInternalPropertyValue(region, target, "length", target),
      ),
    );
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
  "global.Array.prototype.toReversed": (region, that, _input) => {
    const { "global.TypeError": TypeError } = region;
    const target = toInternalReferenceSloppy(region, that);
    const length = clampPositiveInteger(
      region,
      leaveValue(
        region,
        getInternalPropertyValue(region, target, "length", target),
      ),
    );
    const array = createArray(region, 0);
    for (let index = 0; index < length; index++) {
      if (
        !defineInternalPropertyDescriptor(region, array, index, {
          __proto__: null,
          value: getInternalPropertyValue(
            region,
            target,
            length - index - 1,
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
    return array;
  },
  "global.Array.prototype.slice": (region, that, input) => {
    const {
      "global.TypeError": TypeError,
      "global.undefined": undefined,
      "global.Math.min": min,
      "global.Math.max": max,
    } = region;
    const target = toInternalReferenceSloppy(region, that);
    const length = clampPositiveInteger(
      region,
      leaveValue(
        region,
        getInternalPropertyValue(region, target, "length", target),
      ),
    );
    const start = clampInteger(region, atExternal(region, input, 0));
    const original_end = atExternal(region, input, 1);
    const end =
      original_end === undefined ? length : clampInteger(region, original_end);
    const from = start < 0 ? max(length + start, 0) : min(start, length);
    const to = end < 0 ? max(length + end, 0) : min(end, length);
    const array = createSpecieArray(region, target, max(to - from, 0));
    for (let index = from; index < to; index++) {
      if (
        !defineInternalPropertyDescriptor(region, array, index - from, {
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
    return array;
  },
  "global.Array.prototype.concat": (region, that, input) => {
    const {
      "global.TypeError": TypeError,
      "global.Number.MAX_SAFE_INTEGER": MAX_SAFE_INTEGER,
    } = region;
    const target = toInternalReferenceSloppy(region, that);
    const array = createSpecieArray(region, target, 0);
    let result_length = 0;
    const input_length = input.length;
    for (let index = -1; index < input_length; index++) {
      const current = index === -1 ? target : input[index];
      if (
        !isInternalPrimitive(region, current) &&
        isConcatSpreadable(region, current)
      ) {
        const current_length = clampPositiveInteger(
          region,
          leaveValue(
            region,
            getInternalPropertyValue(region, current, "length", current),
          ),
        );
        if (result_length + current_length >= MAX_SAFE_INTEGER) {
          throw new TypeError(
            "Array length exceeds maximum safe integer at Array.prototype.concat",
          );
        }
        for (let index = 0; index < current_length; index++) {
          if (
            !defineInternalPropertyDescriptor(region, array, result_length, {
              __proto__: null,
              value: getInternalPropertyValue(region, current, index, current),
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
      } else {
        if (result_length >= MAX_SAFE_INTEGER) {
          throw new TypeError(
            "Array length exceeds maximum safe integer at Array.prototype.concat",
          );
        }
        if (
          !defineInternalPropertyDescriptor(region, array, result_length, {
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
    return array;
  },
};
