import { getWeakMap, setWeakMap } from "../../util/collection.mjs";
import { LinvailExecError, LinvailTypeError } from "../../error.mjs";
import { isDataDescriptor, isPlainInternalClosure } from "../domain.mjs";
import {
  enterPlainExternalReference,
  enterPrimitive,
  isInternalPrimitive,
} from "./core.mjs";
import { enterPrototype, leaveReference } from "./util.mjs";
import { defineInternalPropertyDescriptor } from "../reflect.mjs";
import { getOwnPlainInternal } from "./property.mjs";

/**
 * @type {(
 *   region: import("./region.d.ts").Region,
 *   closure: (
 *     this: import("../domain.d.ts").InternalValue,
 *     ...args: import("../domain.d.ts").InternalValue[]
 *   ) => import("../domain.d.ts").InternalValue,
 *   options: {
 *     kind: (
 *       | "constructor"
 *       | "method"
 *       | "arrow"
 *       | "function"
 *     ),
 *     prototype: null | import("../domain.d.ts").InternalReference,
 *     name: string,
 *     length: number,
 *   },
 * ) => import("../domain.d.ts").PlainInternalClosure}
 */
export const registerPseudoClosure = (
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
  /** @type {import("../domain.d.ts").PlainInternalClosure} */
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
      !defineInternalPropertyDescriptor(region, prototype, "constructor", {
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
 *   region: import("./region.d.ts").Region,
 *   closure: import("../domain.d.ts").RawPlainInternalClosure,
 *   kind: import("aran").ClosureKind,
 * ) => import("../domain.d.ts").PlainInternalClosure}
 */
export const registerActualClosure = (region, closure, kind) => {
  const {
    plain_internal_closure_kind_mapping,
    "global.Reflect.setPrototypeOf": setPrototypeOf,
    "global.Reflect.getPrototypeOf": getPrototypeOf,
    "global.Reflect.defineProperty": defineProperty,
  } = region;
  /** @type {import("../domain.d.ts").PlainInternalClosure} */
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
          /** @type {import("../domain.d.ts").PlainExternalReference} */ (
            /** @type {unknown} */ (descriptor.value)
          ),
        ),
        writable: true,
        enumerable: false,
        configurable: false,
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
 *   region: import("./region.d.ts").Region,
 *   closure: import("../domain.d.ts").PlainInternalReference,
 *   that: import("../domain.d.ts").InternalValue,
 *   args: import("../domain.d.ts").InternalValue[],
 * ) => import("../domain.d.ts").InternalValue}
 */
export const applyPlainInternalReference = (region, target, that, args) => {
  const {
    "global.TypeError": TypeError,
    "global.Reflect.apply": apply,
    "global.Reflect.getPrototypeOf": getPrototypeOf,
    "global.Reflect.setPrototypeOf": setPrototypeOf,
    generator_prototype_prototype,
    async_generator_prototype_prototype,
    plain_internal_closure_kind_mapping,
  } = region;
  if (!isPlainInternalClosure(target)) {
    throw new TypeError("Invalid closure");
  }
  const kind = getWeakMap(plain_internal_closure_kind_mapping, target);
  if (kind) {
    const result = apply(target, that, args);
    if (kind === "arrow" || kind === "method" || kind === "function") {
      return /** @type {import("../domain.d.ts").InternalValue} */ (result);
    } else if (kind === "generator" || kind === "async-generator") {
      const prototype =
        /** @type {(result: unknown) => import("../domain.d.ts").InternalValue} */ (
          getPrototypeOf
        )(result);
      if (
        !setPrototypeOf(
          /** @type {import("../domain.d.ts").PlainExternalReference} */ (
            result
          ),
          isInternalPrimitive(region, prototype)
            ? kind === "async-generator"
              ? async_generator_prototype_prototype
              : generator_prototype_prototype
            : leaveReference(region, prototype),
        )
      ) {
        throw new LinvailExecError(
          "Cannot set prototype of generator's result",
          { result, region },
        );
      }
      return enterPlainExternalReference(
        region,
        /** @type {import("../domain.d.ts").PlainExternalReference} */ (result),
      );
    } else if (
      kind === "async-arrow" ||
      kind === "async-method" ||
      kind === "async-function"
    ) {
      return enterPlainExternalReference(
        region,
        /** @type {import("../domain.d.ts").PlainExternalReference} */ (result),
      );
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
