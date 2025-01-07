import { compileOracle } from "./oracle/index.mjs";
import { createLibrary } from "./library.mjs";
import { extractAranLibrary } from "./aran.mjs";
import {
  createRegion,
  enterPlainExternalReference,
  enterPlainInternalClosure,
  enterPrimitive,
  enterReference,
  enterValue,
  fromPlainInternalArrayWithExternalPrototype,
  isInternalPrimitive,
  leavePrimitive,
  leaveValue,
} from "./region/index.mjs";
import { cloneGlobal } from "./global.mjs";

/**
 * @type {(
 *   intrinsics: import("aran").AranIntrinsicRecord,
 * ) => {
 *   library: import("./library").Linvail,
 *   advice: import("../advice").Advice,
 * }}
 */
export const createRuntime = (intrinsics) => {
  const global = cloneGlobal(intrinsics["aran.global"]);
  const { library, emission } = createLibrary(intrinsics["aran.global"]);
  const region = createRegion({ global, emission });
  const { apply, construct } = compileOracle({
    region,
    global: cast_global,
    aran: extractAranLibrary(intrinsics),
    linvail: library,
  });
  return {
    library,
    advice: {
      leaveBranch: (value) =>
        isInternalPrimitive(region, value)
          ? !!leavePrimitive(region, value)
          : true,
      enterNewTarget: (new_target) =>
        new_target ? new_target : enterPrimitive(region, new_target),
      enterPrimitive: (primitive) => enterPrimitive(region, primitive),
      enterValue: (value) => enterValue(region, value),
      leaveValue: (value) => leaveValue(region, value),
      enterArgumentList: (input) =>
        fromPlainInternalArrayWithExternalPrototype(region, input),
      enterClosure: (closure, kind) =>
        enterPlainInternalClosure(region, closure, kind),
      apply: (target, that, input) => applyOracle(region, target, that, input),
      construct: (target, input) => applyOracle(region, target, input, target),
      enterIntrinsic: (reference) =>
        enterPlainExternalReference(region, reference),
    },
  };
};
