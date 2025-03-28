import {
  atExternal,
  atInternal,
  createArray,
  getLength,
  toBoolean,
  toInternalPrototype,
  toInternalReferenceSloppy,
  toInternalReferenceStrict,
  toMaybeInternalReferenceSloppy,
  toPropertyKey,
} from "./helper.mjs";
import {
  applyInternal,
  defineInternalPropertyDescriptor,
  getInternalOwnPropertyDescriptor,
  getInternalPropertyValue,
  getInternalPrototype,
  hasInternalOwnProperty,
  listInternalOwnPropertyKey,
} from "../reflect.mjs";
import {
  enterPlainExternalReference,
  enterPrimitive,
} from "../region/core.mjs";

const {
  Object: { hasOwn },
} = globalThis;

/**
 * @type {Record<
 *   keyof import("aran").ExtraIntrinsicRecord,
 *   null | import("../oracle").ApplyOracle
 * >}
 */
export const aran_apply_oracle_mapping = {
  "aran.AsyncGeneratorFunction.prototype.prototype": null, // not a function
  "aran.GeneratorFunction.prototype.prototype": null, // not a function
  "aran.global_object": null, // not a function
  "aran.global_declarative_record": null, // not a function
  "aran.deadzone_symbol": null, // not a function
  "aran.transpileEvalCode": null, // no benefit
  "aran.retropileEvalCode": null, // no benefit
  "aran.declareGlobalVariable": null, // no benefit
  "aran.readGlobalVariable": null, // no benefit
  "aran.typeofGlobalVariable": null, // no benefit
  "aran.discardGlobalVariable": null, // no benefit
  "aran.writeGlobalVariableStrict": null, // no benefit
  "aran.writeGlobalVariableSloppy": null, // no benefit
  "aran.performUnaryOperation": null, // no benefit
  "aran.performBinaryOperation": null, // no benefit
  "aran.throwException": null, // no benefit
  "aran.toPropertyKey": null, // no benefit
  "aran.isConstructor": null, // no benefit
  "aran.listIteratorRest": (region, _that, input) => {
    const {
      "global.Reflect.defineProperty": defineProperty,
      "global.TypeError": TypeError,
    } = region;
    const iterator = toInternalReferenceStrict(
      region,
      atInternal(region, input, 0),
    );
    const next = toInternalReferenceStrict(
      region,
      atInternal(region, input, 1),
    );
    const result = createArray(region, 0);
    let done = false;
    let index = 0;
    while (!done) {
      const step = toInternalReferenceStrict(
        region,
        applyInternal(region, next, iterator, []),
      );
      done = toBoolean(
        region,
        getInternalPropertyValue(region, step, "done", step),
      );
      if (!done) {
        if (
          !defineProperty(result, index, {
            __proto__: null,
            value: getInternalPropertyValue(region, step, "value", step),
            writable: true,
            enumerable: true,
            configurable: true,
          })
        ) {
          throw new TypeError(
            "Cannot set array index at aran.ListIteratorRest",
          );
        }
        index++;
      }
    }
    return result;
  },
  "aran.toArgumentList": (region, _that, input) => {
    const {
      "global.Symbol.iterator": iterator_symbol,
      "global.Array.prototype[@@iterator]": array_iterator,
      "global.Symbol.toStringTag": to_string_tag_symbol,
      "global.TypeError": TypeError,
      "global.Object.prototype": object_prototype,
      "global.Object.create": createObject,
      "global.Reflect.defineProperty": defineProperty,
      "global.Function.prototype.arguments@get": throw_getter,
      "global.Function.prototype.arguments@set": throw_setter,
    } = region;
    const target = toInternalReferenceStrict(
      region,
      atInternal(region, input, 0),
    );
    const length = getLength(region, target);
    const callee = atInternal(region, input, 1);
    const result = createObject(
      enterPlainExternalReference(region, object_prototype),
    );
    for (let index = 0; index < length; index++) {
      if (
        !defineProperty(result, index, {
          __proto__: null,
          value: getInternalPropertyValue(region, target, index, target),
          writable: true,
          enumerable: true,
          configurable: true,
        })
      ) {
        throw new TypeError(
          "Cannot set array-like index at aran.toArgumentList",
        );
      }
    }
    if (
      !defineProperty(result, "length", {
        __proto__: null,
        value: enterPrimitive(region, length),
        writable: true,
        enumerable: false,
        configurable: true,
      })
    ) {
      throw new TypeError(
        "Cannot set array-like length at aran.toArgumentList",
      );
    }
    if (
      !defineProperty(
        result,
        "callee",
        toBoolean(region, callee)
          ? {
              __proto__: null,
              value: callee,
              writable: true,
              enumerable: false,
              configurable: true,
            }
          : {
              __proto__: null,
              get: enterPlainExternalReference(region, throw_getter),
              set: enterPlainExternalReference(region, throw_setter),
              enumerable: false,
              configurable: false,
            },
      )
    ) {
      throw new TypeError(
        "Cannot set array-like callee at aran.toArgumentList",
      );
    }
    if (
      !defineProperty(result, iterator_symbol, {
        __proto__: null,
        value: enterPlainExternalReference(region, array_iterator),
        writable: true,
        enumerable: false,
        configurable: true,
      })
    ) {
      throw new TypeError(
        "Cannot set array-like @@iterator at aran.toArgumentList",
      );
    }
    if (
      !defineProperty(result, to_string_tag_symbol, {
        __proto__: null,
        value: enterPrimitive(region, "Arguments"),
        writable: true,
        enumerable: false,
        configurable: true,
      })
    ) {
      throw new TypeError(
        "Cannot set array-like callee at aran.toArgumentList",
      );
    }
    return result;
  },
  "aran.sliceObject": (region, _that, input) => {
    const {
      "global.Reflect.defineProperty": defineProperty,
      "global.Object.prototype": object_prototype,
      "global.Object.create": createObject,
      "global.TypeError": TypeError,
    } = region;
    const source = toInternalReferenceStrict(
      region,
      atInternal(region, input, 0),
    );
    const exclusion = toInternalReferenceStrict(
      region,
      atInternal(region, input, 1),
    );
    const result = createObject(
      enterPlainExternalReference(region, object_prototype),
    );
    const keys = listInternalOwnPropertyKey(region, source);
    const { length } = keys;
    for (let index = 0; index < length; index++) {
      const key = keys[index];
      if (!hasInternalOwnProperty(region, exclusion, key)) {
        const descriptor = getInternalOwnPropertyDescriptor(
          region,
          source,
          key,
        );
        if (descriptor && descriptor.enumerable) {
          if (
            !defineProperty(result, key, {
              __proto__: null,
              value: getInternalPropertyValue(region, source, key, source),
              writable: true,
              enumerable: true,
              configurable: true,
            })
          ) {
            throw new TypeError("Cannot copy property in aran.sliceObject");
          }
        }
      }
    }
    return result;
  },
  "aran.listForInKey": (region, _that, input) => {
    const {
      "global.TypeError": TypeError,
      "global.Object.create": createObject,
      "global.Reflect.defineProperty": defineProperty,
    } = region;
    let target = toMaybeInternalReferenceSloppy(
      region,
      atInternal(region, input, 0),
    );
    const result = createObject(null);
    /** @type {{[key in PropertyKey]: null}} */
    const visited = /** @type {any} */ ({ __proto__: null });
    let result_length = 0;
    while (target !== null) {
      const keys = listInternalOwnPropertyKey(region, target);
      const current_length = keys.length;
      for (let index = 0; index < current_length; index++) {
        const key = keys[index];
        if (!hasOwn(visited, key)) {
          visited[key] = null;
          if (typeof key === "string") {
            const descriptor = getInternalOwnPropertyDescriptor(
              region,
              target,
              key,
            );
            if (descriptor && descriptor.enumerable) {
              if (
                !defineProperty(result, result_length, {
                  __proto__: null,
                  value: enterPrimitive(region, key),
                  writable: true,
                  enumerable: true,
                  configurable: true,
                })
              ) {
                throw new TypeError(
                  "Cannot set array-like index at aran.listForInKey",
                );
              }
              result_length++;
            }
          }
        }
      }
      target = getInternalPrototype(region, target);
    }
    if (
      !defineProperty(result, "length", {
        __proto__: null,
        value: enterPrimitive(region, result_length),
        writable: true,
        enumerable: true,
        configurable: true,
      })
    ) {
      throw new TypeError("Cannot set array-like length at ara.listForInKey");
    }
    return result;
  },
  "aran.getValueProperty": (region, _that, input) => {
    const receiver = atInternal(region, input, 0);
    const target = toInternalReferenceSloppy(region, receiver);
    const key = toPropertyKey(region, atExternal(region, input, 1));
    return getInternalPropertyValue(region, target, key, receiver);
  },
  "aran.createObject": (region, _that, input) => {
    const { "global.Object.create": create } = region;
    const prototype = toInternalPrototype(region, atInternal(region, input, 0));
    const target = create(prototype);
    const { length } = input;
    for (let index = 1; index < length - 1; index += 2) {
      defineInternalPropertyDescriptor(
        region,
        target,
        toPropertyKey(region, atExternal(region, input, index)),
        {
          value: atInternal(region, input, index + 1),
          writable: true,
          enumerable: true,
          configurable: true,
        },
      );
    }
    return target;
  },
};
