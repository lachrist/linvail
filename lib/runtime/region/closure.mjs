import { LinvailExecError } from "../../error.mjs";
import { wrapStandardPrimitive, wrapReference } from "./core.mjs";
import { wrapFreshHostReference } from "./proxy.mjs";

/**
 * @type {<K extends import("aran").ClosureKind>(
 *   region: import("./region.d.ts").Region,
 *   closure: import("../domain.d.ts").FreshHostClosure,
 *   kind: K,
 * ) => import("../domain.d.ts").HostReferenceWrapper<K>}
 */
export const wrapFreshHostClosure = (region, closure, kind) => {
  const {
    "global.Reflect.defineProperty": defineProperty,
    "global.Reflect.getOwnPropertyDescriptor": getOwnPropertyDescriptor,
  } = region;
  const wrapper = wrapFreshHostReference(
    region,
    kind,
    /** @type {any} */ (closure),
  );
  if (kind === "function") {
    if (
      !defineProperty(wrapper.plain, "prototype", {
        __proto__: null,
        value: wrapStandardPrimitive(region, null),
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
    const descriptor = getOwnPropertyDescriptor(closure, "prototype");
    if (
      !defineProperty(wrapper.plain, "prototype", {
        __proto__: null,
        ...descriptor,
        value: wrapReference(region, descriptor.value),
      })
    ) {
      throw new LinvailExecError(
        "Cannot define prototype property of generator",
        { closure, region },
      );
    }
  }
  if (
    !defineProperty(wrapper.plain, "length", {
      __proto__: null,
      value: wrapStandardPrimitive(region, 0),
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
    !defineProperty(wrapper.plain, "name", {
      __proto__: null,
      value: wrapStandardPrimitive(region, ""),
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
  return wrapper;
};

/**
 * @type {(
 *   region: import("./region.d.ts").Region,
 *   result: import("../domain.d.ts").FreshHostGeneratorResult,
 *   default_prototype: import("../domain.d.ts").Reference,
 * ) => import("../domain.d.ts").ReferenceWrapper}
 */
const enterRawHostGeneratorResult = (region, result, default_prototype) => {
  const {
    "global.Reflect.getPrototypeOf": getPrototypeOf,
    "global.Reflect.setPrototypeOf": setPrototypeOf,
  } = region;
  const wrapper = wrapReference(region, /** @type {any} */ (result));
  if (wrapper.type === "host") {
    throw new LinvailExecError(
      "The result of a generator should never be a host reference",
    );
  }
  const prototype = getPrototypeOf(result);
  if (
    !setPrototypeOf(
      wrapper.inner,
      prototype.type === "primitive" ? default_prototype : prototype.inner,
    )
  ) {
    throw new LinvailExecError("Cannot set prototype of generator's result", {
      result,
      region,
    });
  }
  return wrapper;
};

/**
 * @type {(
 *   region: import("./region.d.ts").Region,
 *   callee: import("../domain.d.ts").HostReferenceWrapper,
 *   that: import("../domain.d.ts").Wrapper,
 *   args: import("../domain.d.ts").Wrapper[],
 * ) => import("../domain.d.ts").Wrapper}
 */
export const applyHostReference = (region, callee, that, args) => {
  const { "global.Reflect.apply": apply } = region;
  switch (callee.kind) {
    case "arrow": {
      return apply(callee.plain, that, args);
    }
    case "function": {
      return apply(callee.plain, that, args);
    }
    case "method": {
      return apply(callee.plain, that, args);
    }
    case "async-arrow": {
      return wrapReference(region, apply(callee.plain, that, args));
    }
    case "async-function": {
      return wrapReference(region, apply(callee.plain, that, args));
    }
    case "async-method": {
      return wrapReference(region, apply(callee.plain, that, args));
    }
    case "async-generator": {
      return enterRawHostGeneratorResult(
        region,
        apply(callee.plain, that, args),
        region.async_generator_prototype_prototype,
      );
    }
    case "generator": {
      return enterRawHostGeneratorResult(
        region,
        apply(callee.plain, that, args),
        region.generator_prototype_prototype,
      );
    }
    default: {
      throw new region["global.TypeError"]("foo");
    }
  }
};

/**
 * @type {<K extends import("aran").ClosureKind>(
 *   region: import("./region.d.ts").Region,
 *   closure: import("../domain.d.ts").HostReference<K>,
 * ) => import("../domain.d.ts").HostReferenceWrapper<K>}
 */
export const wrapHostClosure = ({ host_closure_registery }, closure) =>
  /** @type {import("../domain.d.ts").HostReferenceWrapper<any>} */ (
    host_closure_registery.$get(closure)
  );
