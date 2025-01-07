import { getWeakMap, setWeakMap } from "../../collection.mjs";
import { LinvailExecError, LinvailTypeError } from "../../error.mjs";
import { enterPrimitive } from "./core.mjs";
import { enterPrototype, enterReference } from "./util.mjs";

/**
 * @type {(
 *   region: import(".").Region,
 *   closure: import("../domain").RawPlainInternalClosure,
 *   kind: import("../../instrument").ClosureKind,
 * ) => import("../domain").PlainInternalClosure}
 */
export const enterPlainInternalClosure = (region, closure, kind) => {
  const {
    plain_internal_closure_kind_mapping,
    global: {
      Reflect: {
        setPrototypeOf,
        getPrototypeOf,
        deleteProperty,
        defineProperty,
        getOwnPropertyDescriptor,
      },
    },
  } = region;
  if (
    !setPrototypeOf(closure, enterPrototype(region, getPrototypeOf(closure)))
  ) {
    throw new LinvailExecError("Cannot internalize prototype of closure", {
      closure,
      region,
    });
  }
  const prototype_descriptor = getOwnPropertyDescriptor(closure, "prototype");
  if (prototype_descriptor) {
    if (
      !defineProperty(closure, "prototype", {
        ...prototype_descriptor,
        value: enterPrimitive(region, null),
      })
    ) {
      throw new LinvailExecError(
        "Cannot redefine prototype property of closure",
        { closure, region },
      );
    }
  }
  if (!deleteProperty(closure, "length")) {
    throw new LinvailExecError("Cannot delete length property of closure", {
      closure,
      region,
    });
  }
  if (!deleteProperty(closure, "name")) {
    throw new LinvailExecError("Cannot delete name property of closure", {
      closure,
      region,
    });
  }
  /** @type {import("../domain").PlainInternalClosure} */
  const result = /** @type {any} */ (closure);
  setWeakMap(plain_internal_closure_kind_mapping, result, kind);
  return result;
};

/**
 * @type {(
 *   region: import(".").Region,
 *   closure: import("../domain").PlainInternalReference,
 *   that: import("../domain").InternalValue,
 *   args: import("../domain").InternalValue[],
 * ) => import("../domain").InternalValue}
 */
export const applyPlainInternalClosure = (region, target, that, args) => {
  const {
    global: {
      Reflect: { apply },
    },
    plain_internal_closure_kind_mapping,
  } = region;
  const kind = getWeakMap(plain_internal_closure_kind_mapping, target);
  if (kind) {
    const result = apply(/** @type {any} */ (target), that, args);
    if (kind === "arrow" || kind === "method" || kind === "function") {
      return result;
    } else if (
      kind === "arrow.async" ||
      kind === "method.async" ||
      kind === "function.async" ||
      kind === "generator" ||
      kind === "generator.async"
    ) {
      return enterReference(region, result);
    } else {
      throw new LinvailTypeError(kind);
    }
  } else {
    throw new LinvailExecError("Closure kind not found", {
      target,
      region,
    });
  }
};
