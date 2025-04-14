import { LinvailExecError } from "../../error.mjs";
import { hasOwnNarrow } from "../../util/record.mjs";
import { isDataDescriptor, isNonLengthPropertyKey } from "../domain.mjs";
import { wrapReference, wrapStandardPrimitive } from "./core.mjs";

const {
  Object: { hasOwn },
} = globalThis;

////////////////
// getOwnHost //
////////////////

/**
 * @type {(
 *   region: import("../region.d.ts").Region,
 *   target: import("../domain.d.ts").HostReference,
 *   key: PropertyKey,
 * ) => undefined | import("../domain.d.ts").HostDescriptor}
 */
export const getOwnHost = (region, target, key) => {
  const {
    "global.Reflect.getOwnPropertyDescriptor": getOwnPropertyDescriptor,
    "global.Array.isArray": isArray,
  } = region;
  if (isArray(target)) {
    if (isNonLengthPropertyKey(key)) {
      return getOwnPropertyDescriptor(target, key);
    } else {
      const descriptor = getOwnPropertyDescriptor(target, "length");
      return {
        ...descriptor,
        value: wrapStandardPrimitive(region, descriptor.value),
      };
    }
  } else {
    return getOwnPropertyDescriptor(target, key);
  }
};

///////////////////
// defineOwnHost //
///////////////////

/**
 * @type {(
 *   region: import("../region.d.ts").Region,
 *   descriptor: import("../domain.d.ts").HostDefineDescriptor
 * ) => import("../domain.d.ts").GuestDefineDescriptor}
 */
const toGuestDefineDescriptor = (_region, host_descriptor) => {
  /** @type {import("../domain.d.ts").GuestDefineDescriptor} */
  const guest_descriptor = { __proto__: null };
  if (hasOwnNarrow(host_descriptor, "get")) {
    guest_descriptor.get = host_descriptor.get;
  }
  if (hasOwnNarrow(host_descriptor, "set")) {
    guest_descriptor.set = host_descriptor.set;
  }
  if (hasOwnNarrow(host_descriptor, "value")) {
    guest_descriptor.value = host_descriptor.value.inner;
  }
  if (hasOwnNarrow(host_descriptor, "writable")) {
    guest_descriptor.writable = host_descriptor.writable;
  }
  if (hasOwnNarrow(host_descriptor, "enumerable")) {
    guest_descriptor.enumerable = host_descriptor.enumerable;
  }
  if (hasOwnNarrow(host_descriptor, "configurable")) {
    guest_descriptor.configurable = host_descriptor.configurable;
  }
  return guest_descriptor;
};

/**
 * @type {(
 *   region: import("../region.d.ts").Region,
 *   old_descriptor: undefined | import("../domain.d.ts").HostDescriptor,
 *   new_descriptor: import("../domain.d.ts").HostDefineDescriptor,
 * ) => import("../domain.d.ts").HostDefineDescriptor}
 */
const sanitizeHostDefineDescriptor = (
  region,
  old_descriptor,
  new_descriptor,
) => {
  const { "global.undefined": undefined, "global.Object.is": is } = region;
  if (
    !hasOwn(new_descriptor, "get") &&
    !hasOwn(new_descriptor, "set") &&
    !hasOwn(new_descriptor, "value") &&
    !old_descriptor
  ) {
    return {
      ...new_descriptor,
      value: wrapStandardPrimitive(region, undefined),
    };
  }
  if (
    old_descriptor &&
    isDataDescriptor(old_descriptor) &&
    hasOwnNarrow(new_descriptor, "value") &&
    is(old_descriptor.value.inner, new_descriptor.value.inner)
  ) {
    return {
      ...new_descriptor,
      value: old_descriptor.value,
    };
  }
  return new_descriptor;
};

/**
 * @type {(
 *   region: import("../region.d.ts").Region,
 *   target: import("../domain.d.ts").HostReference,
 *   key: PropertyKey,
 *   descriptor: import("../domain.d.ts").HostDefineDescriptor,
 * ) => boolean}
 */
export const defineOwnHost = (region, target, key, descriptor) => {
  const {
    "global.Reflect.defineProperty": defineProperty,
    "global.Reflect.getOwnPropertyDescriptor": getOwnPropertyDescriptor,
    "global.Array.isArray": isArray,
  } = region;
  if (isArray(target)) {
    if (isNonLengthPropertyKey(key)) {
      return defineProperty(
        target,
        key,
        sanitizeHostDefineDescriptor(
          region,
          getOwnPropertyDescriptor(target, key),
          descriptor,
        ),
      );
    } else {
      return defineProperty(
        target,
        "length",
        toGuestDefineDescriptor(region, descriptor),
      );
    }
  } else {
    return defineProperty(
      target,
      key,
      sanitizeHostDefineDescriptor(
        region,
        getOwnPropertyDescriptor(target, key),
        descriptor,
      ),
    );
  }
};

///////////////
// applyHost //
///////////////

/**
 * @type {(
 *   region: import("../region.d.ts").Region,
 *   result: import("../domain.d.ts").FreshHostGeneratorResult,
 *   default_prototype: import("../domain.d.ts").Reference,
 * ) => import("../domain.d.ts").ReferenceWrapper}
 */
const wrapRawHostGeneratorResult = (region, result, default_prototype) => {
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
 *   region: import("../region.d.ts").Region,
 *   callee: import("../domain.d.ts").HostReferenceWrapper,
 *   that: import("../domain.d.ts").Wrapper,
 *   args: import("../domain.d.ts").Wrapper[],
 * ) => import("../domain.d.ts").Wrapper}
 */
export const applyHost = (region, callee, that, args) => {
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
      return wrapRawHostGeneratorResult(
        region,
        apply(callee.plain, that, args),
        region.async_generator_prototype_prototype,
      );
    }
    case "generator": {
      return wrapRawHostGeneratorResult(
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
 * @type {(
 *   region: import("../region.d.ts").Region,
 *   target: import("../domain.d.ts").HostReferenceWrapper,
 *   prototype: null | import("../domain.d.ts").ReferenceWrapper,
 * ) => boolean}
 */
export const setHostPrototype = (region, target, prototype) => {
  const {
    "global.Reflect.getPrototypeOf": getPrototypeOf,
    "global.Reflect.setPrototypeOf": setPrototypeOf,
  } = region;
  if (prototype === null) {
    return setPrototypeOf(target.plain, null);
  } else {
    /** @type {null | import("../domain.d.ts").Reference} */
    let current = target.inner;
    while (current !== null) {
      if (current === prototype.inner) {
        return false;
      }
      // This breaks abstraction, normally we should switch case on wrapper type.
      // This allows accepting a prototype that is a reference instead of a wrapper.
      current = getPrototypeOf(/** @type {any} */ (current));
    }
    return setPrototypeOf(/** @type {any} */ (target.plain), prototype.inner);
  }
};
