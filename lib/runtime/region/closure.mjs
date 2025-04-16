import { LinvailExecError } from "../../error.mjs";
import { wrapStandardPrimitive, wrapReference } from "./core.mjs";
import { wrapFreshHostReference } from "./proxy.mjs";

/**
 * @type {<K extends import("aran").ClosureKind>(
 *   region: import("../region.d.ts").Region,
 *   closure: import("../domain.d.ts").FreshHostClosure,
 *   kind: K,
 * ) => import("../domain.d.ts").HostReferenceWrapper<K>}
 */
export const wrapFreshHostClosure = (region, closure, kind) => {
  const {
    host_closure_registry,
    "global.Reflect.defineProperty": defineProperty,
    "global.Reflect.getOwnPropertyDescriptor": getOwnPropertyDescriptor,
  } = region;
  const wrapper = wrapFreshHostReference(
    region,
    kind,
    /** @type {any} */ (closure),
  );
  host_closure_registry.$set(wrapper.plain, wrapper);
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
 * @type {<K extends import("aran").ClosureKind>(
 *   region: import("../region.d.ts").Region,
 *   closure: import("../domain.d.ts").HostReference<K>,
 * ) => import("../domain.d.ts").HostReferenceWrapper<K>}
 */
export const wrapHostClosure = ({ host_closure_registry }, closure) =>
  /** @type {import("../domain.d.ts").HostReferenceWrapper<any>} */ (
    host_closure_registry.$get(closure)
  );
