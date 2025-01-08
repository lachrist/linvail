import { getWeakMap, setWeakMap } from "../../collection.mjs";
import { LinvailExecError, LinvailTypeError } from "../../error.mjs";
import { isPlainInternalClosure } from "../domain.mjs";
import { enterPrimitive } from "./core.mjs";
import { enterPrototype, enterReference } from "./util.mjs";

/**
 * @type {(
 *   region: import(".").Region,
 *   closure: (
 *     this: import("../domain").InternalValue,
 *     ...args: import("../domain").InternalValue[]
 *   ) => import("../domain").InternalValue,
 *   options: {
 *     kind: (
 *       | "constructor"
 *       | "method"
 *       | "arrow"
 *       | "function"
 *     ),
 *     prototype: null | import("../domain").InternalValue,
 *     name: string,
 *     length: number,
 *   },
 * ) => import("../domain").PlainInternalClosure}
 */
export const enterPseudoClosure = (
  region,
  closure,
  { kind, prototype, name, length },
) => {
  const {
    plain_internal_closure_kind_mapping,
    global: {
      Object: { hasOwn },
      Function: {
        prototype: { __self: function_prototype },
      },
      Reflect: { setPrototypeOf, defineProperty },
    },
  } = region;
  /** @type {import("../domain").PlainInternalClosure} */
  const cast_closure = /** @type {any} */ (closure);
  if (
    !setPrototypeOf(cast_closure, enterPrototype(region, function_prototype))
  ) {
    throw new LinvailExecError("Cannot internalize prototype of closure", {
      closure,
      region,
    });
  }
  if (kind === "arrow" || kind === "method") {
    if (prototype) {
      throw new LinvailExecError("Illegal prototype attribute", {
        closure,
        region,
      });
    }
    if (hasOwn(cast_closure, "prototype")) {
      throw new LinvailExecError("Illegal prototype property", {
        closure,
        region,
      });
    }
  } else if (kind === "constructor" || kind === "function") {
    if (!prototype) {
      throw new LinvailExecError("Missing prototype attribute", {
        closure,
        region,
      });
    }
    if (
      !defineProperty(cast_closure, "prototype", {
        __proto__: null,
        value: prototype,
        writable: kind === "function",
        enumerable: false,
        configurable: false,
      })
    ) {
      throw new LinvailExecError(
        "Cannot define prototype property of closure",
        { closure, region },
      );
    }
  } else {
    throw new LinvailTypeError(kind);
  }
  if (
    !defineProperty(cast_closure, "length", {
      __proto__: null,
      value: enterPrimitive(region, length),
      writable: false,
      enumerable: false,
      configurable: true,
    })
  ) {
    throw new LinvailExecError("Cannot define length property of closure", {
      closure,
      region,
    });
  }
  if (
    !defineProperty(cast_closure, "name", {
      __proto__: null,
      value: enterPrimitive(region, name),
      writable: false,
      enumerable: false,
      configurable: true,
    })
  ) {
    throw new LinvailExecError("Cannot define name property of closure", {
      closure,
      region,
    });
  }
  setWeakMap(
    plain_internal_closure_kind_mapping,
    cast_closure,
    kind === "constructor" ? "function" : kind,
  );
  return cast_closure;
};

/**
 * @type {(
 *   region: import(".").Region,
 *   closure: import("../domain").RawPlainInternalClosure,
 *   kind: import("../../instrument").ClosureKind,
 * ) => import("../domain").PlainInternalClosure}
 */
export const enterActualClosure = (region, closure, kind) => {
  const {
    plain_internal_closure_kind_mapping,
    global: {
      Reflect: {
        setPrototypeOf,
        getPrototypeOf,
        deleteProperty,
        defineProperty,
      },
    },
  } = region;
  /** @type {import("../domain").PlainInternalClosure} */
  const cast_closure = /** @type {any} */ (closure);
  if (
    !setPrototypeOf(
      cast_closure,
      enterPrototype(region, getPrototypeOf(closure)),
    )
  ) {
    throw new LinvailExecError("Cannot internalize prototype of closure", {
      closure,
      region,
    });
  }
  if (
    !defineProperty(cast_closure, "prototype", {
      __proto__: null,
      value: enterPrimitive(region, null),
      enumerable: false,
      configurable: false,
      writable: true,
    })
  ) {
    throw new LinvailExecError(
      "Cannot redefine prototype property of closure",
      { closure, region },
    );
  }
  if (!deleteProperty(cast_closure, "length")) {
    throw new LinvailExecError("Cannot delete length property of closure", {
      closure,
      region,
    });
  }
  if (!deleteProperty(cast_closure, "name")) {
    throw new LinvailExecError("Cannot delete name property of closure", {
      closure,
      region,
    });
  }
  setWeakMap(plain_internal_closure_kind_mapping, cast_closure, kind);
  return cast_closure;
};

/**
 * @type {(
 *   region: import(".").Region,
 *   closure: import("../domain").PlainInternalReference,
 *   that: import("../domain").InternalValue,
 *   args: import("../domain").InternalValue[],
 * ) => import("../domain").InternalValue}
 */
export const applyPlainInternalReference = (region, target, that, args) => {
  const {
    global: {
      TypeError,
      Reflect: { apply },
    },
    plain_internal_closure_kind_mapping,
  } = region;
  if (!isPlainInternalClosure(target)) {
    throw new TypeError("Invalid closure");
  }
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
