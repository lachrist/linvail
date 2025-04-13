import { createLibrary } from "../library/create.mjs";
import { createRegion } from "./region/create.mjs";
import { cloneIntrinsic } from "./intrinsic.mjs";
import {
  addEventListener,
  enterStandardPrimitive,
  removeEventListener,
  enterValue,
  enterSymbolPrimitive,
  enterReference,
  createEmptyObject,
} from "./region/core.mjs";
import { enterHostClosure, enterFreshHostClosure } from "./region/closure.mjs";
import { applyInternal, constructInternal } from "./reflect.mjs";
import { LinvailExecError, LinvailTypeError } from "../error.mjs";
import { defineOwnPlainInternal } from "./region/property.mjs";
import { isDataDescriptor } from "./domain.mjs";
import {
  apply_oracle_mapping,
  construct_oracle_mapping,
  fetchIntrinsic,
} from "./oracle.mjs";
import { listKey } from "../util/record.mjs";
import { enterFreshHostReference } from "./region/proxy.mjs";
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
        defineOwnPlainInternal(region, wrapper, key, {
          __proto__: null,
          ...descriptor,
          value:
            descriptor.value === reference
              ? wrapper
              : enterValue(region, descriptor.value),
        });
      } else {
        defineOwnPlainInternal(region, wrapper, key, {
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
 *   config: {
 *     dir: (value: unknown) => void,
 *   },
 * ) => {
 *   library: import("../linvail.js").Library,
 *   advice: import("../advice.d.ts").Advice,
 * }}
 */
export const createRuntime = (intrinsics, { dir }) => {
  const { eval: evalGlobal } = intrinsics["aran.global_object"];
  const {
    createIntegrityFunction,
    createIntegrityArrow,
    generator_prototype_prototype,
    async_generator_prototype_prototype,
  } = evalGlobal(`
    'use strict';
    const { Reflect: { getPrototypeOf } } = globalThis;
    ({
      createIntegrityFunction: () => (function () {}),
      createIntegrityArrow: () => (() => {}),
      generator_prototype_prototype: getPrototypeOf(
        (function* () {}).prototype
      ),
      async_generator_prototype_prototype: getPrototypeOf(
        (async function* () {}).prototype
      ),
    });
  `);
  const region = createRegion({
    record: cloneIntrinsic(intrinsics.globalThis),
    dir,
    createIntegrityFunction,
    createIntegrityArrow,
    generator_prototype_prototype,
    async_generator_prototype_prototype,
  });
  const library = createLibrary(region);
  {
    const root = {
      global: intrinsics.globalThis,
      aran: intrinsics,
      linvail: library,
    };
    const { naming } = region;
    for (const name of listKey(apply_oracle_mapping)) {
      if (apply_oracle_mapping[name]) {
        naming.$set(fetchIntrinsic(region, root, name), name);
      }
    }
    for (const name of listKey(construct_oracle_mapping)) {
      if (construct_oracle_mapping[name]) {
        naming.$set(fetchIntrinsic(region, root, name), name);
      }
    }
  }
  return {
    library,
    advice: {
      addEventListener: (event, listener) =>
        addEventListener(region, event, listener),
      removeEventListener: (event, listener) =>
        removeEventListener(region, event, listener),
      weaveEvalProgram: (_root) => {
        throw new LinvailExecError(
          "Support for direct eval call requires to overwrite advice.weaveEvalProgram.",
        );
      },
      enterSymbolPrimitive: (symbol) => enterSymbolPrimitive(region, symbol),
      enterReference: (reference) => enterReference(region, reference),
      internalize: compileInternalize(region),
      enterStandardPrimitive: (primitive) =>
        enterStandardPrimitive(region, primitive),
      enterValue: (value) => enterValue(region, value),
      leaveValue: ({ base }) => base,
      enterFreshHostArray: (reference) =>
        enterFreshHostReference(region, "array", reference),
      enterHostClosure: (closure) => enterHostClosure(region, closure),
      enterFreshHostClosure: (closure, kind) =>
        enterFreshHostClosure(region, closure, kind),
      apply: (target, that, input) =>
        applyInternal(region, target, that, input),
      construct: (target, input) =>
        constructInternal(region, target, input, target),
    },
  };
};
