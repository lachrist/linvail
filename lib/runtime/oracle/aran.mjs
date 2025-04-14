import {
  atExternal,
  atInternal,
  getLength,
  toPrototype,
  toInternalReferenceSloppy,
  toInternalReferenceStrict,
  toMaybeInternalReferenceSloppy,
  toPropertyKey,
  void_oracle,
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
  wrapStandardPrimitive,
  wrapReference,
  wrapPrototype,
} from "../region/core.mjs";
import { createEmptyArray, createEmptyObject } from "../region/create.mjs";

const {
  Object: { hasOwn },
} = globalThis;

/**
 * @type {Record<
 *   keyof import("aran").ExtraIntrinsicRecord,
 *   import("../oracle.d.ts").Oracle
 * >}
 */
export const aran_oracle_record = {
  "aran.AsyncGeneratorFunction.prototype.prototype": void_oracle, // not a function
  "aran.GeneratorFunction.prototype.prototype": void_oracle, // not a function
  "aran.global_object": void_oracle, // not a function
  "aran.global_declarative_record": void_oracle, // not a function
  "aran.deadzone_symbol": void_oracle, // not a function
  "aran.transpileEvalCode": void_oracle, // no benefit
  "aran.retropileEvalCode": void_oracle, // no benefit
  "aran.declareGlobalVariable": void_oracle, // no benefit
  "aran.readGlobalVariable": void_oracle, // no benefit
  "aran.typeofGlobalVariable": void_oracle, // no benefit
  "aran.discardGlobalVariable": void_oracle, // no benefit
  "aran.writeGlobalVariableStrict": void_oracle, // no benefit
  "aran.writeGlobalVariableSloppy": void_oracle, // no benefit
  "aran.performUnaryOperation": void_oracle, // no benefit
  "aran.performBinaryOperation": void_oracle, // no benefit
  "aran.throwException": void_oracle, // no benefit
  "aran.toPropertyKey": void_oracle, // no benefit
  "aran.isConstructor": void_oracle, // no benefit
  "aran.listIteratorRest": {
    construct: null,
    apply: (region, _that, input) => {
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
      const result = createEmptyArray(region, 0);
      let done = false;
      let index = 0;
      while (!done) {
        const step = toInternalReferenceStrict(
          region,
          applyInternal(region, next, iterator, []),
        );
        done = !!getInternalPropertyValue(region, step, "done", step).inner;
        if (!done) {
          if (
            !defineProperty(result.plain, index, {
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
  },
  "aran.toArgumentList": {
    construct: null,
    apply: (region, _that, input) => {
      const {
        "global.Symbol.iterator": iterator_symbol,
        "global.Array.prototype[@@iterator]": array_iterator,
        "global.Symbol.toStringTag": to_string_tag_symbol,
        "global.TypeError": TypeError,
        "global.Object.prototype": object_prototype,
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
      const result = createEmptyObject(region, object_prototype);
      for (let index = 0; index < length; index++) {
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
            "Cannot set array-like index at aran.toArgumentList",
          );
        }
      }
      if (
        !defineProperty(result.plain, "length", {
          __proto__: null,
          value: wrapStandardPrimitive(region, length),
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
          result.plain,
          "callee",
          callee.inner
            ? {
                __proto__: null,
                value: callee,
                writable: true,
                enumerable: false,
                configurable: true,
              }
            : {
                __proto__: null,
                get: throw_getter,
                set: throw_setter,
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
        !defineProperty(result.plain, iterator_symbol, {
          __proto__: null,
          value: wrapReference(region, array_iterator),
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
        !defineProperty(result.plain, to_string_tag_symbol, {
          __proto__: null,
          value: wrapStandardPrimitive(region, "Arguments"),
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
  },
  "aran.sliceObject": {
    construct: null,
    apply: (region, _that, input) => {
      const {
        "global.Reflect.defineProperty": defineProperty,
        "global.Object.prototype": object_prototype,
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
      const result = createEmptyObject(region, object_prototype);
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
              !defineProperty(result.plain, key, {
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
  },
  "aran.listForInKey": {
    construct: null,
    apply: (region, _that, input) => {
      const {
        "global.TypeError": TypeError,
        "global.Reflect.defineProperty": defineProperty,
      } = region;
      const target = toMaybeInternalReferenceSloppy(
        region,
        atInternal(region, input, 0),
      );
      const result = createEmptyObject(region, null);
      /** @type {{[key in PropertyKey]: null}} */
      const visited = /** @type {any} */ ({ __proto__: null });
      let result_length = 0;
      /** @type {null | import("../domain.d.ts").ReferenceWrapper} */
      let current = target;
      while (current !== null) {
        const keys = listInternalOwnPropertyKey(region, current);
        const current_length = keys.length;
        for (let index = 0; index < current_length; index++) {
          const key = keys[index];
          if (!hasOwn(visited, key)) {
            visited[key] = null;
            if (typeof key === "string") {
              const descriptor = getInternalOwnPropertyDescriptor(
                region,
                current,
                key,
              );
              if (descriptor && descriptor.enumerable) {
                if (
                  !defineProperty(result.plain, result_length, {
                    __proto__: null,
                    value: wrapStandardPrimitive(region, key),
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
        current = wrapPrototype(region, getInternalPrototype(region, current));
      }
      if (
        !defineProperty(result.plain, "length", {
          __proto__: null,
          value: wrapStandardPrimitive(region, result_length),
          writable: true,
          enumerable: true,
          configurable: true,
        })
      ) {
        throw new TypeError("Cannot set array-like length at ara.listForInKey");
      }
      return result;
    },
  },
  "aran.getValueProperty": {
    construct: null,
    apply: (region, _that, input) => {
      const receiver = atInternal(region, input, 0);
      const target = toInternalReferenceSloppy(region, receiver);
      const key = toPropertyKey(region, atExternal(region, input, 1));
      return getInternalPropertyValue(region, target, key, receiver);
    },
  },
  "aran.createObject": {
    construct: null,
    apply: (region, _that, input) => {
      const prototype = toPrototype(region, atInternal(region, input, 0));
      const target = createEmptyObject(region, prototype);
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
  },
};
