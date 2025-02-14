import {
  atExternal,
  atInternal,
  fromPlainInternalArrayWithExternalPrototype,
  toActualNumber,
  toBoolean,
  toInternalClosureSloppy,
  toInternalClosureStrict,
  toInternalReferenceSloppy,
  toInternalReferenceStrict,
} from "../convert.mjs";
import {
  applyInternal,
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
  const initial_length = toActualNumber(
    region,
    leaveValue(
      region,
      getInternalPropertyValue(region, target_reference, "length", target),
    ),
  );
  const array = fromPlainInternalArrayWithExternalPrototype(
    region,
    Array(initial_length),
  );
  let index = 0;
  let length = initial_length;
  while (index < length) {
    if (hasInternalProperty(region, target_reference, index)) {
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
    }
    index++;
    length = toActualNumber(
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
        throw new TypeError("@@iterator is not a function");
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
    const { "global.undefined": undefined } = region;
    const target = that;
    const target_reference = toInternalReferenceSloppy(region, target);
    let index = toActualNumber(region, atExternal(region, input, 0));
    const length = toActualNumber(
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
    const {
      "global.Array": Array,
      "global.Reflect.defineProperty": defineProperty,
    } = region;
    const target = that;
    const target_reference = toInternalReferenceSloppy(region, target);
    const predicate = toInternalClosureStrict(
      region,
      atInternal(region, input, 0),
    );
    const this_arg = atInternal(region, input, 1);
    const length = toActualNumber(
      region,
      leaveValue(
        region,
        getInternalPropertyValue(region, target_reference, "length", target),
      ),
    );
    const array = fromPlainInternalArrayWithExternalPrototype(
      region,
      Array(length),
    );
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
          defineProperty(array, res_index, {
            __proto__: null,
            value: item,
            writable: true,
            enumerable: true,
            configurable: true,
          });
          res_index++;
        }
      }
      arg_index++;
    }
    if (res_index < length) {
      defineProperty(array, "length", {
        __proto__: null,
        value: res_index,
        writable: true,
        enumerable: false,
        configurable: false,
      });
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
    const length = toActualNumber(
      region,
      leaveValue(
        region,
        getInternalPropertyValue(region, target_reference, "length", target),
      ),
    );
    for (let index = 0; index < length; index++) {
      if (hasInternalProperty(region, target_reference, index)) {
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
    const length = toActualNumber(
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
    const {
      "global.Array": Array,
      "global.Reflect.defineProperty": defineProperty,
    } = region;
    const target = that;
    const target_reference = toInternalReferenceSloppy(region, target);
    const transform = toInternalClosureStrict(
      region,
      atInternal(region, input, 0),
    );
    const this_arg = atInternal(region, input, 1);
    const length = toActualNumber(
      region,
      leaveValue(
        region,
        getInternalPropertyValue(region, target_reference, "length", target),
      ),
    );
    const array = fromPlainInternalArrayWithExternalPrototype(
      region,
      Array(length),
    );
    for (let index = 0; index < length; index++) {
      defineProperty(array, index, {
        __proto__: null,
        value: applyInternal(region, transform, this_arg, [
          getInternalPropertyValue(region, target_reference, index, target),
          enterPrimitive(region, index),
          target_reference,
        ]),
        writable: true,
        enumerable: true,
        configurable: true,
      });
    }
    return array;
  },
  "global.Array.prototype.pop": (region, that, _input) => {
    const { "global.undefined": undefined } = region;
    const target = that;
    const target_reference = toInternalReferenceSloppy(region, target);
    const length = toActualNumber(
      region,
      leaveValue(
        region,
        getInternalPropertyValue(region, target_reference, "length", target),
      ),
    );
    if (length === 0) {
      setInternalPropertyValue(
        region,
        target_reference,
        "length",
        enterPrimitive(region, 0),
        target,
      );
      return enterPrimitive(region, undefined);
    } else {
      const value = getInternalPropertyValue(
        region,
        target_reference,
        length - 1,
        target,
      );
      deleteInternalOwnProperty(region, target_reference, length - 1);
      setInternalPropertyValue(
        region,
        target_reference,
        "length",
        enterPrimitive(region, length - 1),
        target,
      );
      return value;
    }
  },
  "global.Array.prototype.push": (region, that, input) => {
    const target = that;
    const target_reference = toInternalReferenceSloppy(region, target);
    const length = toActualNumber(
      region,
      leaveValue(
        region,
        getInternalPropertyValue(region, target_reference, "length", target),
      ),
    );
    for (let index = 0; index < input.length; index++) {
      setInternalPropertyValue(
        region,
        target_reference,
        length + index,
        input[index],
        target,
      );
    }
    setInternalPropertyValue(
      region,
      target_reference,
      "length",
      enterPrimitive(region, length + input.length),
      target,
    );
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
    const length = toActualNumber(
      region,
      leaveValue(
        region,
        getInternalPropertyValue(region, target_reference, "length", target),
      ),
    );
    let accumulation = initial_value;
    if (input.length < 2) {
      if (length === 0) {
        throw new TypeError("Reduce of empty array with no initial value");
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
