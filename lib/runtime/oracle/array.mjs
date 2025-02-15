import {
  atExternal,
  atInternal,
  createArraySpecie,
  fromPlainInternalArrayWithExternalPrototype,
  toPositiveInteger,
  toBoolean,
  toInternalClosureSloppy,
  toInternalClosureStrict,
  toInternalReferenceSloppy,
  toInternalReferenceStrict,
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
 *   target: import("../domain").InternalValue,
 *   reference: import("../domain").InternalReference,
 *   transform: null | import("../domain").InternalReference,
 *   this_arg: import("../domain").InternalValue,
 * ) => import("../domain").PlainInternalArray}
 */
const convertArrayLike = (
  region,
  target,
  target_reference,
  transform,
  this_arg,
) => {
  const {
    "global.Array": Array,
    "global.Reflect.defineProperty": defineProperty,
  } = region;
  const initial_length = toPositiveInteger(
    region,
    leaveValue(
      region,
      getInternalPropertyValue(region, target_reference, "length", target),
    ),
  );
  const array = fromPlainInternalArrayWithExternalPrototype(
    region,
    new Array(initial_length),
  );
  let index = 0;
  let length = initial_length;
  while (index < length) {
    const item = getInternalPropertyValue(
      region,
      target_reference,
      index,
      target,
    );
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
    length = toPositiveInteger(
      region,
      leaveValue(
        region,
        getInternalPropertyValue(region, target_reference, "length", target),
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
  const {
    "global.Array.of": toArray,
    "global.Reflect.defineProperty": defineProperty,
  } = region;
  let done = false;
  const next = toInternalReferenceStrict(
    region,
    getInternalPropertyValue(region, iterator, "next", iterator),
  );
  const array = fromPlainInternalArrayWithExternalPrototype(region, toArray());
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
          try {
            const close = getInternalPropertyValue(
              region,
              iterator,
              "return",
              iterator,
            );
            if (!isInternalPrimitive(region, close)) {
              applyInternal(region, close, iterator, []);
            }
          } catch {
            /* noop */
          }
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
  "global.Array.of": (region, _that, input) => {
    const {
      "global.undefined": undefined,
      "global.Array.of": toArray,
      "global.Reflect.apply": apply,
    } = region;
    return fromPlainInternalArrayWithExternalPrototype(
      region,
      apply(toArray, undefined, input),
    );
  },
  "global.Array.from": (region, _that, input) => {
    const {
      "global.TypeError": TypeError,
      "global.Symbol.iterator": iterator_symbol,
      "global.Array.prototype[@@iterator]": array_iterator,
      "global.Object.is": is,
    } = region;
    const target = atInternal(region, input, 0);
    const reference = toInternalReferenceSloppy(region, target);
    const transform = toInternalClosureSloppy(
      region,
      atInternal(region, input, 1),
    );
    const this_arg = atInternal(region, input, 2);
    const generate = getInternalPropertyValue(
      region,
      reference,
      iterator_symbol,
      target,
    );
    if (isInternalPrimitive(region, generate)) {
      if (leavePrimitive(region, generate) == null) {
        return convertArrayLike(region, target, reference, transform, this_arg);
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
        return convertArrayLike(region, target, reference, transform, this_arg);
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
    const {
      "global.undefined": undefined,
      "global.Number": Number,
      "global.Math.trunc": trunc,
    } = region;
    const target = that;
    const target_reference = toInternalReferenceSloppy(region, target);
    let index = trunc(Number(atExternal(region, input, 0)));
    const length = toPositiveInteger(
      region,
      leaveValue(
        region,
        getInternalPropertyValue(region, target_reference, "length", target),
      ),
    );
    if (index < 0) {
      index += length;
    }
    if (index < 0 || index >= length) {
      return enterPrimitive(region, undefined);
    } else {
      return getInternalPropertyValue(region, target_reference, index, target);
    }
  },
  "global.Array.prototype.filter": (region, that, input) => {
    const { "global.TypeError": TypeError } = region;
    const target = that;
    const target_reference = toInternalReferenceSloppy(region, target);
    const predicate = toInternalClosureStrict(
      region,
      atInternal(region, input, 0),
    );
    const this_arg = atInternal(region, input, 1);
    const length = toPositiveInteger(
      region,
      leaveValue(
        region,
        getInternalPropertyValue(region, target_reference, "length", target),
      ),
    );
    const array = createArraySpecie(region, target_reference, 0);
    let arg_index = 0;
    let res_index = 0;
    while (arg_index < length) {
      if (hasInternalProperty(region, target_reference, arg_index)) {
        const item = getInternalPropertyValue(
          region,
          target_reference,
          arg_index,
          target,
        );
        if (
          toBoolean(
            region,
            applyInternal(region, predicate, this_arg, [
              item,
              enterPrimitive(region, arg_index),
              target_reference,
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
    const target = that;
    const target_reference = toInternalReferenceSloppy(region, target);
    const predicate = toInternalClosureStrict(
      region,
      atInternal(region, input, 0),
    );
    const this_arg = atInternal(region, input, 1);
    const length = toPositiveInteger(
      region,
      leaveValue(
        region,
        getInternalPropertyValue(region, target_reference, "length", target),
      ),
    );
    for (let index = 0; index < length; index++) {
      const value = getInternalPropertyValue(
        region,
        target_reference,
        index,
        target,
      );
      if (
        toBoolean(
          region,
          applyInternal(region, predicate, this_arg, [
            value,
            enterPrimitive(region, index),
            target_reference,
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
    const target = that;
    const target_reference = toInternalReferenceSloppy(region, target);
    const callback = toInternalClosureStrict(
      region,
      atInternal(region, input, 0),
    );
    const this_arg = atInternal(region, input, 1);
    const length = toPositiveInteger(
      region,
      leaveValue(
        region,
        getInternalPropertyValue(region, target_reference, "length", target),
      ),
    );
    for (let index = 0; index < length; index++) {
      if (hasInternalProperty(region, target_reference, index)) {
        applyInternal(region, callback, this_arg, [
          getInternalPropertyValue(region, target_reference, index, target),
          enterPrimitive(region, index),
          target_reference,
        ]);
      }
    }
    return enterPrimitive(region, undefined);
  },
  "global.Array.prototype.map": (region, that, input) => {
    const { "global.TypeError": TypeError } = region;
    const target = that;
    const target_reference = toInternalReferenceSloppy(region, target);
    const transform = toInternalClosureStrict(
      region,
      atInternal(region, input, 0),
    );
    const this_arg = atInternal(region, input, 1);
    const length = toPositiveInteger(
      region,
      leaveValue(
        region,
        getInternalPropertyValue(region, target_reference, "length", target),
      ),
    );
    const array = createArraySpecie(region, target_reference, length);
    for (let index = 0; index < length; index++) {
      if (hasInternalProperty(region, target_reference, index)) {
        if (
          !defineInternalPropertyDescriptor(region, array, index, {
            __proto__: null,
            value: applyInternal(region, transform, this_arg, [
              getInternalPropertyValue(region, target_reference, index, target),
              enterPrimitive(region, index),
              target_reference,
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
    const target = that;
    const target_reference = toInternalReferenceSloppy(region, target);
    const length = toPositiveInteger(
      region,
      leaveValue(
        region,
        getInternalPropertyValue(region, target_reference, "length", target),
      ),
    );
    if (length === 0) {
      if (
        !setInternalPropertyValue(
          region,
          target_reference,
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
        target_reference,
        length - 1,
        target,
      );
      if (!deleteInternalOwnProperty(region, target_reference, length - 1)) {
        throw new TypeError("Cannot delete array index at Array.prototype.pop");
      }
      if (
        !setInternalPropertyValue(
          region,
          target_reference,
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
    const target = that;
    const target_reference = toInternalReferenceSloppy(region, target);
    const length = toPositiveInteger(
      region,
      leaveValue(
        region,
        getInternalPropertyValue(region, target_reference, "length", target),
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
          target_reference,
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
        target_reference,
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
    const { "global.undefined": undefined, "global.TypeError": TypeError } =
      region;
    const target = that;
    const target_reference = toInternalReferenceSloppy(region, target);
    const accumulate = toInternalClosureStrict(
      region,
      atInternal(region, input, 0),
    );
    const initial_value = atInternal(region, input, 1);
    const length = toPositiveInteger(
      region,
      leaveValue(
        region,
        getInternalPropertyValue(region, target_reference, "length", target),
      ),
    );
    let accumulation = initial_value;
    if (input.length < 2) {
      if (length === 0) {
        throw new TypeError(
          "Missing initial value while reducing empty array at Array.prototype.reduce",
        );
      } else {
        accumulation = getInternalPropertyValue(
          region,
          target_reference,
          0,
          target,
        );
      }
    }
    for (let index = input.length < 2 ? 1 : 0; index < length; index++) {
      accumulation = applyInternal(
        region,
        accumulate,
        enterPrimitive(region, undefined),
        [
          accumulation,
          getInternalPropertyValue(region, target_reference, index, target),
          enterPrimitive(region, index),
          target_reference,
        ],
      );
    }
    return accumulation;
  },
};
