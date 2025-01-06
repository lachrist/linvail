import { compileOracle } from "./oracle/index.mjs";
import { createLibrary } from "./library.mjs";
import { extractAranLibrary } from "./aran.mjs";
import { createRegion } from "./region.mjs";

/**
 * @type {(
 *   global: import("./global").Global,
 *   region: import("./region").Region,
 * ) => import("../advice").Advice["enterArgumentList"]}
 */
const compileEnterArgumentList =
  (
    { Error, Reflect: { getPrototypeOf, setPrototypeOf } },
    { enterPrototype },
  ) =>
  (args) => {
    if (!setPrototypeOf(args, enterPrototype(getPrototypeOf(args)))) {
      throw new Error("Failed to harmonize prototype");
    }
    return /** @type {any} */ (args);
  };

/**
 * @type {(
 *   intrinsics: import("aran").AranIntrinsicRecord,
 * ) => {
 *   library: import("./library").Linvail,
 *   advice: import("../advice").Advice,
 * }}
 */
export const createRuntime = (intrinsics) => {
  const global = intrinsics["aran.global"];
  const cast_global = /** @type {import("./global").Global} */ (
    /** @type {unknown} */ (global)
  );
  const { library, emission } = createLibrary(global);
  const region = createRegion(cast_global, emission);
  const { apply, construct } = compileOracle({
    region,
    global: cast_global,
    aran: extractAranLibrary(intrinsics),
    linvail: library,
  });
  const {
    enterPlainInternalClosure,
    enterPrimitive,
    enterValue,
    leaveValue,
    isInternalPrimitive,
    leavePrimitive,
    enterPlainExternalReference,
  } = region;
  return {
    library,
    advice: {
      leaveBranch: (value) =>
        isInternalPrimitive(value) ? !!leavePrimitive(value) : true,
      enterNewTarget: (new_target) =>
        new_target == null ? enterPrimitive(new_target) : new_target,
      enterPrimitive,
      enterValue,
      leaveValue,
      enterArgumentList: compileEnterArgumentList(cast_global, region),
      enterClosure: enterPlainInternalClosure,
      apply,
      construct,
      enterPlainExternalReference,
    },
  };
};
