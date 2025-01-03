import { compileOracle } from "./oracle/index.mjs";
import { createLibrary } from "./library.mjs";
import { extractAranLibrary } from "./aran.mjs";
import { createRegion } from "./region.mjs";

/**
 * @type {(
 *   global: typeof globalThis,
 *   region: import("./region").Region,
 * ) => import("../advice").Advice["enterArgumentList"]}
 */
const compileEnterArgumentList =
  (
    { Error, Reflect: { getPrototypeOf, setPrototypeOf } },
    { enterPrototype },
  ) =>
  (args) => {
    if (
      !setPrototypeOf(
        args,
        enterPrototype(
          /** @type {import("./domain").PlainExternalReference} */ (
            getPrototypeOf(args)
          ),
        ),
      )
    ) {
      throw new Error("Failed to harmonize prototype");
    }
    return /** @type {any} */ (args);
  };

/**
 * @type {(
 *   global: typeof globalThis,
 *   region: import("./region").Region,
 * ) => import("../advice").Advice["enterClosure"]}
 */
const compileEnterClosure =
  (
    {
      Error,
      Reflect: {
        getOwnPropertyDescriptor,
        defineProperty,
        getPrototypeOf,
        setPrototypeOf,
        deleteProperty,
      },
    },
    { enterPrimitive, enterPlainExternalReference },
  ) =>
  (closure) => {
    const prototype_descriptor = getOwnPropertyDescriptor(closure, "prototype");
    if (prototype_descriptor) {
      if (
        !defineProperty(closure, "prototype", {
          ...prototype_descriptor,
          value: enterPrimitive(null),
        })
      ) {
        throw new Error("Cannot redefine prototype property of closure");
      }
    }
    if (!deleteProperty(closure, "length")) {
      throw new Error("Cannot delete length property of closure");
    }
    if (!deleteProperty(closure, "name")) {
      throw new Error("Cannot delete name property of closure");
    }
    if (
      !setPrototypeOf(
        closure,
        enterPlainExternalReference(
          /** @type {import("./domain").PlainExternalReference} */ (
            getPrototypeOf(closure)
          ),
        ),
      )
    ) {
      throw new Error("Cannot internalize prototype of closure");
    }
    return /** @type {any} */ (closure);
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
      enterArgumentList: compileEnterArgumentList(global, region),
      enterClosure: compileEnterClosure(global, region),
      apply,
      construct,
      enterPlainExternalReference,
    },
  };
};
