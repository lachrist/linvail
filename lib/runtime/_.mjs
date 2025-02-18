import { createLibrary } from "./library.mjs";
import { createRegion } from "./region/region.mjs";
import { setupIntrinsic } from "./intrinsic.mjs";
import {
  enterPlainExternalReference,
  enterPlainInternalArrayWithExternalPrototype,
  enterPrimitive,
  isInternalPrimitive,
  leavePlainInternalReference,
  leavePrimitive,
} from "./region/core.mjs";
import {
  enterAccessor,
  enterPrototype,
  enterValue,
  leaveValue,
} from "./region/util.mjs";
import { enterActualClosure } from "./region/closure.mjs";
import { applyInternal, constructInternal } from "./reflect.mjs";
import { LinvailExecError } from "../error.mjs";
import { defineOwnPlainInternal } from "./region/property.mjs";
import { isDataDescriptor } from "./domain.mjs";
export { standard_pointcut, toStandardAdvice } from "./standard.mjs";

/**
 * @type {(
 *   region: import("./region/region").Region,
 * ) => (
 *   reference: import("./domain").PlainExternalReference,
 * ) => import("./domain").PlainInternalReference}
 */
const compileInternalize = (region) => (reference) => {
  const {
    "global.Object.create": createObject,
    "global.Reflect.getPrototypeOf": getPrototypeOf,
    "global.Reflect.getOwnPropertyDescriptor": getOwnPropertyDescriptor,
    "global.Reflect.ownKeys": listKey,
  } = region;
  const copy = createObject(enterPrototype(region, getPrototypeOf(reference)));
  const keys = listKey(reference);
  const { length } = keys;
  for (let index = 0; index < length; index++) {
    const key = keys[index];
    const descriptor = getOwnPropertyDescriptor(reference, key);
    if (descriptor) {
      if (isDataDescriptor(descriptor)) {
        const { value, writable, enumerable, configurable } = descriptor;
        defineOwnPlainInternal(region, copy, key, {
          __proto__: null,
          value: enterValue(region, value),
          writable,
          enumerable,
          configurable,
        });
      } else {
        const { get, set, enumerable, configurable } = descriptor;
        defineOwnPlainInternal(region, copy, key, {
          __proto__: null,
          get: enterAccessor(region, get),
          set: enterAccessor(region, set),
          enumerable,
          configurable,
        });
      }
    }
  }
  return copy;
};

/**
 * @type {(
 *   intrinsics: import("aran").IntrinsicRecord,
 *   config: {
 *     dir: (value: unknown) => void,
 *   },
 * ) => {
 *   library: import("./domain").GuestExternalReference,
 *   advice: import("../advice").Advice,
 * }}
 */
export const createRuntime = (intrinsics, { dir }) => {
  const { TypeError, eval: evalGlobal } = intrinsics["aran.global_object"];
  const region = createRegion({
    ...setupIntrinsic(intrinsics),
    createIntegrityFunction: /** @type {() => Function} */ (
      evalGlobal("'use strict'; () => (function () {});")
    ),
    createIntegrityArrow: /** @type {() => Function} */ (
      evalGlobal("'use strict'; () => (() => {});")
    ),
  });
  return {
    library: leavePlainInternalReference(
      region,
      createLibrary(region, { dir }),
    ),
    advice: {
      weaveEvalProgram: (_root) => {
        throw new LinvailExecError(
          "Support for direct eval call requires to overwrite advice.weaveEvalProgram.",
        );
      },
      internalize: compileInternalize(region),
      isInternalPrimitive: (value) => isInternalPrimitive(region, value),
      leaveBoolean: (value) =>
        isInternalPrimitive(region, value)
          ? !!leavePrimitive(region, value)
          : true,
      enterPrimitive: (primitive) => enterPrimitive(region, primitive),
      enterValue: (value) => enterValue(region, value),
      leaveValue: (value) => leaveValue(region, value),
      leavePrimitive: (primitive) => leavePrimitive(region, primitive),
      enterArgumentList: (input) =>
        enterPlainInternalArrayWithExternalPrototype(region, input),
      enterClosure: (closure, kind) =>
        enterActualClosure(region, closure, kind),
      enterPlainExternalReference: (reference) =>
        enterPlainExternalReference(region, reference),
      leavePlainInternalReference: (reference) =>
        leavePlainInternalReference(region, reference),
      apply: (target, that, input) => {
        if (isInternalPrimitive(region, target)) {
          throw new TypeError("Cannot apply primitive");
        } else {
          return applyInternal(region, target, that, input);
        }
      },
      construct: (target, input) => {
        if (isInternalPrimitive(region, target)) {
          throw new TypeError("Cannot construct primitive");
        } else {
          return constructInternal(region, target, input, target);
        }
      },
    },
  };
};
