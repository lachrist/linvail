import { createLibrary } from "./library.mjs";
import { createRegion } from "./region/region.mjs";
import { setupIntrinsic } from "./intrinsic.mjs";
import {
  fromPlainInternalArrayWithExternalPrototype,
  toBoolean,
} from "./convert.mjs";
import {
  enterPlainExternalReference,
  enterPrimitive,
  isInternalPrimitive,
  leavePlainInternalReference,
  leavePrimitive,
} from "./region/core.mjs";
import { enterValue, leaveValue } from "./region/util.mjs";
import { enterActualClosure } from "./region/closure.mjs";
import { applyInternal, constructInternal } from "./reflect.mjs";
import { LinvailExecError } from "../error.mjs";
export { standard_pointcut, toStandardAdvice } from "./standard.mjs";

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
export const createRuntime = (intrinsics, config) => {
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
    library: leavePlainInternalReference(region, createLibrary(region, config)),
    advice: {
      weaveEvalProgram: (_root) => {
        throw new LinvailExecError(
          "Support for direct eval call requires to overwrite advice.weaveEvalProgram.",
        );
      },
      isInternalPrimitive: (value) => isInternalPrimitive(region, value),
      leaveBoolean: (value) => toBoolean(region, value),
      enterPrimitive: (primitive) => enterPrimitive(region, primitive),
      enterValue: (value) => enterValue(region, value),
      leaveValue: (value) => leaveValue(region, value),
      leavePrimitive: (primitive) => leavePrimitive(region, primitive),
      enterArgumentList: (input) =>
        fromPlainInternalArrayWithExternalPrototype(region, input),
      enterClosure: (closure, kind) =>
        enterActualClosure(region, closure, kind),
      enterPlainExternalReference: (reference) =>
        enterPlainExternalReference(region, reference),
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
