import { createLibrary } from "../library/create.mjs";
import { createRegion } from "./region/create.mjs";
import { cloneIntrinsic } from "./intrinsic.mjs";
import {
  wrapStandardPrimitive,
  wrapValue,
  wrapSymbolPrimitive,
  wrapReference,
  createEmptyObject,
} from "./region/wrap.mjs";
import { wrapHostClosure, wrapFreshHostClosure } from "./region/closure.mjs";
import { applyInternal, constructInternal } from "./reflect.mjs";
import { LinvailExecError, LinvailTypeError } from "../error.mjs";
import { defineOwnHost } from "./region/property.mjs";
import { isDataDescriptor } from "./domain.mjs";
import { fillOracleName } from "./oracle.mjs";
import { wrapFreshHostReference } from "./region/proxy.mjs";
export { standard_pointcut, toStandardAdvice } from "./standard.mjs";

/**
 * @type {(
 *   region: import("./region/region.d.ts").Region,
 *   reference: import("./domain.d.ts").GuestReference,
 *   config: {
 *     prototype: "none" | "copy" | "Object.prototype",
 *   },
 * ) => null | import("./domain.d.ts").Reference}
 */
const getPrototype = (region, reference, config) => {
  switch (config.prototype) {
    case "none": {
      return null;
    }
    case "copy": {
      const { "global.Reflect.getPrototypeOf": getPrototypeOf } = region;
      return getPrototypeOf(reference);
    }
    case "Object.prototype": {
      const { "global.Object.prototype": object_prototype } = region;
      return object_prototype;
    }
    default: {
      throw new LinvailTypeError(config.prototype);
    }
  }
};

/**
 * @type {(
 *   region: import("./region/region.d.ts").Region,
 * ) => (
 *   reference: import("./domain.d.ts").GuestReference,
 *   config: {
 *     prototype: "none" | "copy" | "Object.prototype",
 *   },
 * ) => import("./domain.d.ts").HostReferenceWrapper}
 */
const compileInternalize = (region) => (reference, config) => {
  const {
    "global.Reflect.getOwnPropertyDescriptor": getOwnPropertyDescriptor,
    "global.Reflect.ownKeys": listKey,
  } = region;
  const wrapper = createEmptyObject(
    region,
    getPrototype(region, reference, config),
  );
  const keys = listKey(reference);
  const { length } = keys;
  for (let index = 0; index < length; index++) {
    const key = keys[index];
    const descriptor = getOwnPropertyDescriptor(reference, key);
    if (descriptor) {
      if (isDataDescriptor(descriptor)) {
        defineOwnHost(region, wrapper.plain, key, {
          __proto__: null,
          ...descriptor,
          value:
            descriptor.value === reference
              ? wrapper
              : wrapValue(region, descriptor.value),
        });
      } else {
        defineOwnHost(region, wrapper.plain, key, {
          __proto__: null,
          ...descriptor,
        });
      }
    }
  }
  return wrapper;
};

/**
 * @type {(
 *   intrinsics: import("aran").IntrinsicRecord,
 *   config: Partial<import("./config.js").Config>,
 * ) => {
 *   library: import("../linvail.d.ts").Library,
 *   advice: import("../advice.d.ts").Advice,
 * }}
 */
export const createRuntime = (intrinsics, config) => {
  const region = createRegion({
    intrinsics: cloneIntrinsic(intrinsics.globalThis),
    config,
  });
  const library = createLibrary(region);
  fillOracleName(region, {
    global: intrinsics.globalThis,
    aran: intrinsics,
    linvail: library,
  });
  return {
    library,
    advice: {
      weaveEvalProgram: (_root) => {
        throw new LinvailExecError(
          "Support for direct eval call requires to overwrite advice.weaveEvalProgram.",
        );
      },
      enterSymbolPrimitive: (symbol) => wrapSymbolPrimitive(region, symbol),
      enterReference: (reference) => wrapReference(region, reference),
      internalize: compileInternalize(region),
      enterStandardPrimitive: (primitive) =>
        wrapStandardPrimitive(region, primitive),
      enterValue: (value) => wrapValue(region, value),
      leaveValue: ({ inner }) => inner,
      enterFreshHostArray: (reference) =>
        wrapFreshHostReference(region, "array", reference),
      enterHostClosure: (closure) => wrapHostClosure(region, closure),
      enterFreshHostClosure: (closure, kind) =>
        wrapFreshHostClosure(region, closure, kind),
      apply: (target, that, input) =>
        applyInternal(region, target, that, input),
      construct: (target, input) =>
        constructInternal(region, target, input, target),
    },
  };
};
