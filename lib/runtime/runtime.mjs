import { createLibrary } from "../library/create.mjs";
import { createRegion } from "./region/create.mjs";
import { cloneIntrinsic } from "./intrinsic.mjs";
import {
  addEventListener,
  enterPlainExternalReference,
  sanitizePlainInternalArrayWithExternalPrototype,
  enterPrimitive,
  isInternalPrimitive,
  leavePlainInternalReference,
  leavePrimitive,
  removeEventListener,
  isGuestInternalReference,
} from "./region/core.mjs";
import { enterAccessor, enterValue, leaveValue } from "./region/util.mjs";
import { registerActualClosure } from "./region/closure.mjs";
import { applyInternal, constructInternal } from "./reflect.mjs";
import { LinvailExecError } from "../error.mjs";
import { defineOwnPlainInternal } from "./region/property.mjs";
import { isDataDescriptor } from "./domain.mjs";
import {
  apply_oracle_mapping,
  construct_oracle_mapping,
  fetchIntrinsic,
} from "./oracle.mjs";
import { setMap } from "../util/collection.mjs";
import { listKey } from "../util/record.mjs";
export { standard_pointcut, toStandardAdvice } from "./standard.mjs";

/**
 * @type {(
 *   region: import("./region/region.d.ts").Region,
 * ) => (
 *   reference: import("./domain.d.ts").PlainExternalReference,
 *   config: {
 *     prototype: null | "global.Object.prototype" | "global.Array.prototype",
 *   },
 * ) => import("./domain.d.ts").PlainInternalReference}
 */
const compileInternalize =
  (region) =>
  (reference, { prototype }) => {
    const {
      "global.Object.create": createObject,
      "global.Reflect.getOwnPropertyDescriptor": getOwnPropertyDescriptor,
      "global.Reflect.ownKeys": listKey,
    } = region;
    const copy = createObject(
      prototype && enterPlainExternalReference(region, region[prototype]),
    );
    const keys = listKey(reference);
    const { length } = keys;
    for (let index = 0; index < length; index++) {
      const key = keys[index];
      const descriptor = getOwnPropertyDescriptor(reference, key);
      if (descriptor) {
        if (isDataDescriptor(descriptor)) {
          const { value, writable, enumerable, configurable } = descriptor;
          defineOwnPlainInternal(region, copy, key, {
            __proto__: null,
            value: value === reference ? copy : enterValue(region, value),
            writable,
            enumerable,
            configurable,
          });
        } else {
          const { get, set, enumerable, configurable } = descriptor;
          defineOwnPlainInternal(region, copy, key, {
            __proto__: null,
            get: enterAccessor(region, get),
            set: enterAccessor(region, set),
            enumerable,
            configurable,
          });
        }
      }
    }
    return copy;
  };

/**
 * @type {(
 *   intrinsics: import("aran").IntrinsicRecord,
 *   config: {
 *     dir: (value: unknown) => void,
 *     count: boolean,
 *   },
 * ) => {
 *   library: import("./domain.d.ts").ExternalReference,
 *   advice: import("../advice.d.ts").Advice,
 * }}
 */
export const createRuntime = (intrinsics, { dir, count }) => {
  const { TypeError, eval: evalGlobal } = intrinsics["aran.global_object"];
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
    count,
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
        setMap(naming, fetchIntrinsic(region, root, name), name);
      }
    }
    for (const name of listKey(construct_oracle_mapping)) {
      if (construct_oracle_mapping[name]) {
        setMap(naming, fetchIntrinsic(region, root, name), name);
      }
    }
  }
  return {
    library,
    advice: {
      isGuestInternalReference: /** @type {any} */ (
        (/** @type {import("./domain.d.ts").InternalValue} */ value) =>
          !isInternalPrimitive(region, value) &&
          isGuestInternalReference(region, value)
      ),
      isPlainInternalReference: /** @type {any} */ (
        (/** @type {import("./domain.d.ts").InternalValue} */ value) =>
          !isInternalPrimitive(region, value) &&
          !isGuestInternalReference(region, value)
      ),
      addEventListener: (event, listener) =>
        addEventListener(region, event, listener),
      removeEventListener: (event, listener) =>
        removeEventListener(region, event, listener),
      weaveEvalProgram: (_root) => {
        throw new LinvailExecError(
          "Support for direct eval call requires to overwrite advice.weaveEvalProgram.",
        );
      },
      internalize: compileInternalize(region),
      isInternalPrimitive: (value) => isInternalPrimitive(region, value),
      leaveBoolean: (value) =>
        isInternalPrimitive(region, value)
          ? !!leavePrimitive(region, value)
          : true,
      enterPrimitive: (primitive) => enterPrimitive(region, primitive),
      enterValue: (value) => enterValue(region, value),
      leaveValue: (value) => leaveValue(region, value),
      leavePrimitive: (primitive) => leavePrimitive(region, primitive),
      enterArgumentList: (input) =>
        sanitizePlainInternalArrayWithExternalPrototype(
          region,
          input,
          enterPlainExternalReference(region, region["global.Array.prototype"]),
        ),
      enterClosure: (closure, kind) =>
        registerActualClosure(region, closure, kind),
      enterPlainExternalReference: (reference) =>
        enterPlainExternalReference(region, reference),
      leavePlainInternalReference: (reference) =>
        leavePlainInternalReference(region, reference),
      apply: (target, that, input) => {
        if (isInternalPrimitive(region, target)) {
          throw new TypeError("Cannot apply primitive");
        } else {
          return applyInternal(region, target, that, input);
        }
      },
      construct: (target, input) => {
        if (isInternalPrimitive(region, target)) {
          throw new TypeError("Cannot construct primitive");
        } else {
          return constructInternal(region, target, input, target);
        }
      },
    },
  };
};
