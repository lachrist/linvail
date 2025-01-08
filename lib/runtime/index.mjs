import {
  applyInternalReference,
  constructInternalReference,
  createOracleRegistery,
} from "./oracle/registery.mjs";
import { createLibrary } from "./library.mjs";
import {
  createRegion,
  enterActualClosure,
  enterPlainExternalReference,
  enterPrimitive,
  enterValue,
  isInternalPrimitive,
  leavePrimitive,
  leaveValue,
} from "./region/index.mjs";
import { cloneGlobal } from "./global.mjs";
import { fromPlainInternalArrayWithExternalPrototype } from "./convert.mjs";

/**
 * @type {(
 *   intrinsics: import("aran").AranIntrinsicRecord,
 * ) => {
 *   library: import("./domain").PlainInternalObject,
 *   advice: import("../advice").Advice,
 * }}
 */
export const createRuntime = (intrinsics) => {
  const { TypeError } = intrinsics["aran.global"];
  const region = createRegion(cloneGlobal(intrinsics));
  const oracles = createOracleRegistery(intrinsics);
  return {
    library: createLibrary(region),
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
        enterActualClosure(region, closure, kind),
      enterPlainExternalReference: (reference) =>
        enterPlainExternalReference(region, reference),
      apply: (target, that, input) => {
        if (isInternalPrimitive(region, target)) {
          throw new TypeError("Cannot apply primitive");
        } else {
          return applyInternalReference(region, oracles, target, that, input);
        }
      },
      construct: (target, input) => {
        if (isInternalPrimitive(region, target)) {
          throw new TypeError("Cannot construct primitive");
        } else {
          return constructInternalReference(
            region,
            oracles,
            target,
            input,
            target,
          );
        }
      },
    },
  };
};
