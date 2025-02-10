import { getWeakMap, setWeakMap } from "../../util/collection.mjs";
import { LinvailExecError, LinvailTypeError } from "../../error.mjs";
import { isDataDescriptor, isPlainInternalClosure } from "../domain.mjs";
import { enterPlainExternalReference, enterPrimitive } from "./core.mjs";
import { enterPrototype, enterReference } from "./util.mjs";
import { defineInternalProperty } from "../reflect.mjs";
import { getOwnPlainInternal } from "./property.mjs";

/**
 * @type {(
 *   region: import("./region").Region,
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
 *     prototype: null | import("../domain").InternalReference,
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
    "global.Object.hasOwn": hasOwn,
    "global.Function.prototype": function_prototype,
    "global.Reflect.setPrototypeOf": setPrototypeOf,
    "global.Reflect.defineProperty": defineProperty,
  } = region;
  /** @type {import("../domain").PlainInternalClosure} */
  const cast_closure = /** @type {any} */ (closure);
  /* c8 ignore start */
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
    if (
      !defineInternalProperty(region, prototype, "constructor", {
        __proto__: null,
        value: cast_closure,
        writable: true,
        enumerable: false,
        configurable: true,
      })
    ) {
      throw new LinvailExecError(
        "Cannot define constructor property of prototype",
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
  /* c8 ignore start */
  return cast_closure;
};

/**
 * @type {(
 *   region: import("./region").Region,
 *   closure: import("../domain").RawPlainInternalClosure,
 *   kind: import("aran").ClosureKind,
 * ) => import("../domain").PlainInternalClosure}
 */
export const enterActualClosure = (region, closure, kind) => {
  const {
    plain_internal_closure_kind_mapping,
    "global.Reflect.setPrototypeOf": setPrototypeOf,
    "global.Reflect.getPrototypeOf": getPrototypeOf,
    "global.Reflect.defineProperty": defineProperty,
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
  if (kind === "function") {
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
        "Cannot define prototype property of function",
        { closure, region },
      );
    }
  } else if (kind === "generator" || kind === "async-generator") {
    const descriptor = getOwnPlainInternal(region, cast_closure, "prototype");
    if (!descriptor) {
      throw new LinvailExecError("Missing prototype property in generator", {
        closure,
        region,
      });
    }
    if (!isDataDescriptor(descriptor)) {
      throw new LinvailExecError(
        "Illegal accessor prototype property in generator",
        {
          descriptor,
          closure,
          region,
        },
      );
    }
    if (
      !defineProperty(cast_closure, "prototype", {
        __proto__: null,
        value: enterPlainExternalReference(
          region,
          /** @type {import("../domain").PlainExternalReference} */ (
            /** @type {unknown} */ (descriptor.value)
          ),
        ),
        enumerable: false,
        configurable: false,
        writable: true,
      })
    ) {
      throw new LinvailExecError(
        "Cannot define prototype property of generator",
        { closure, region },
      );
    }
  }
  if (
    !defineProperty(cast_closure, "length", {
      __proto__: null,
      value: enterPrimitive(region, 0),
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
      value: enterPrimitive(region, ""),
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
  setWeakMap(plain_internal_closure_kind_mapping, cast_closure, kind);
  return cast_closure;
};

/**
 * @type {(
 *   region: import("./region").Region,
 *   closure: import("../domain").PlainInternalReference,
 *   that: import("../domain").InternalValue,
 *   args: import("../domain").InternalValue[],
 * ) => import("../domain").InternalValue}
 */
export const applyPlainInternalReference = (region, target, that, args) => {
  const {
    "global.TypeError": TypeError,
    "global.Reflect.apply": apply,
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
      kind === "async-arrow" ||
      kind === "async-method" ||
      kind === "async-function" ||
      kind === "generator" ||
      kind === "async-generator"
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
