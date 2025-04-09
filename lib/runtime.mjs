export {
  createRuntime,
  standard_pointcut,
  toStandardAdvice,
} from "./runtime/runtime.mjs";
import { createRuntime } from "./runtime/runtime.mjs";
import { library_hidden_variable } from "./library/library-variable.mjs";

const {
  Error,
  Reflect: { defineProperty },
} = globalThis;

/**
 * @type {(
 *   intrinsics: import("aran").IntrinsicRecord,
 *   config: {
 *     dir: (value: unknown) => void,
 *     count: boolean,
 *   },
 * ) => import("./advice.d.ts").Advice}
 */
export const setupRuntime = (intrinsics, config) => {
  if (library_hidden_variable in intrinsics.globalThis) {
    throw new Error("Linvail is already set up");
  }
  const { advice, library } = createRuntime(intrinsics, config);
  const descriptor = {
    __proto__: null,
    value: library,
    writable: true,
    enumerable: false,
    configurable: true,
  };
  defineProperty(intrinsics.globalThis, library_hidden_variable, descriptor);
  return advice;
};
