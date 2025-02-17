import {
  atExternal,
  atInternal,
  createArray,
  toInternalPrototype,
  toInternalReferenceSloppy,
  toPropertyKey,
} from "../convert.mjs";
import {
  defineInternalPropertyDescriptor,
  getInternalOwnPropertyDescriptor,
  getInternalPropertyValue,
  getInternalPrototype,
  listInternalOwnPropertyKey,
} from "../reflect.mjs";
import { enterPrimitive } from "../region/core.mjs";

/** @type {import("../oracle").ApplyOracleMapping} */
export const aran_apply_oracle_mapping = {
  // aran.transpileEvalCode >> no benefit
  // aran.retropileEvalCode >> no benefit
  // aran.declareGlobalVariable >> no benefit
  // aran.readGlobalVariable >> no benefit
  // aran.typeofGlobalVariable >> no benefit
  // aran.discardGlobalVariable >> no benefit
  // aran.writeGlobalVariableStrict >> no benefit
  // aran.writeGlobalVariableSloppy >> no benefit
  // aran.performUnaryOperation >> no benefit
  // aran.performBinaryOperation >> no benefit
  // aran.throwException >> no benefit
  // aran.toPropertyKey >> no benefit
  // aran.isConstructor >> no benefit
  // aran.toArgumentList >> TODO
  // aran.sliceObject >> TODO
  // aran.listIteratorRest >> TODO
  "aran.listForInKey": (region, _that, input) => {
    const {
      "global.TypeError": TypeError,
      "global.Reflect.defineProperty": defineProperty,
    } = region;
    /**
     * @type {import("../domain").InternalReference | null}
     */
    let target = toInternalReferenceSloppy(
      region,
      atInternal(region, input, 0),
    );
    const result = createArray(region, 0);
    let result_length = 0;
    while (target !== null) {
      const keys = listInternalOwnPropertyKey(region, target);
      const current_length = keys.length;
      for (let index = 0; index < current_length; index++) {
        const key = keys[index];
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
                "Cannot set array index at aran.listForInKey",
              );
            }
            result_length++;
          }
        }
      }
      target = getInternalPrototype(region, target);
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
