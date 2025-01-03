import { compileOracle } from "./oracle/index.mjs";
import { createLibrary } from "./library.mjs";
import { extractAranLibrary } from "./aran.mjs";
import { createRegion } from "./region.mjs";

/**
 * @type {(
 *   global: typeof globalThis,
 *   region: import("./region").Region,
 * ) => (
 *   closure: Function,
 * ) => import("./domain").InternalReference}
 */
const compileEnterClosure =
  (
    {
      Error,
      Object: { hasOwn },
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
      console.dir({ prototype_descriptor });
      if (!hasOwn(prototype_descriptor, "value")) {
        throw new Error("Prototype descriptor should be a data descriptor");
      }
      if (
        !defineProperty(closure, "prototype", {
          ...prototype_descriptor,
          value: enterPrimitive(null),
        })
      ) {
        throw new Error("Cannot redefine prototype descriptor");
      }
    }
    deleteProperty(closure, "length");
    deleteProperty(closure, "name");
    setPrototypeOf(
      closure,
      enterPlainExternalReference(
        /** @type {import("./domain").PlainExternalReference} */ (
          getPrototypeOf(closure)
        ),
      ),
    );
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
    harmonizePrototype,
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
      enterArgumentList: harmonizePrototype,
      enterClosure: compileEnterClosure(global, region),
      apply,
      construct: (callee, args) => construct(callee, args, callee),
      enterPlainExternalReference,
    },
  };
};
