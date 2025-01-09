import { createLibrary } from "./library.mjs";
import { createRegion } from "./region/index.mjs";
import { cloneGlobal } from "./global.mjs";
import {
  fromPlainInternalArrayWithExternalPrototype,
  toBoolean,
} from "./convert.mjs";
import { createOracleRegistery } from "./oracle/registery.mjs";
import {
  enterPlainExternalReference,
  enterPrimitive,
  isInternalPrimitive,
  leavePlainInternalReference,
} from "./region/core.mjs";
import { enterValue, leaveValue } from "./region/util.mjs";
import { enterActualClosure } from "./region/closure.mjs";
import {
  applyInternalReference,
  constructInternalReference,
} from "./oracle/calling.mjs";

/**
 * @type {(
 *   intrinsics: import("aran").AranIntrinsicRecord,
 * ) => {
 *   library: import("./domain").GuestExternalReference,
 *   advice: import("../advice").Advice,
 * }}
 */
export const createRuntime = (intrinsics) => {
  const { TypeError } = intrinsics["aran.global"];
  const region = createRegion(cloneGlobal(intrinsics));
  const oracles = createOracleRegistery(intrinsics);
  return {
    library: leavePlainInternalReference(region, createLibrary(region)),
    advice: {
      leaveBoolean: (value) => toBoolean(region, value),
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
