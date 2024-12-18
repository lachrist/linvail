import { compileCalling } from "./calling.mjs";
import { createMembrane } from "./membrane.mjs";
import { createLibrary } from "./library.mjs";
import { isPrimitive } from "../util.mjs";
import { extractAranLibrary } from "./aran.mjs";

/**
 * @type {<X>(
 *   global: typeof globalThis,
 * ) => (
 *   closure: Function,
 * ) => import("./reflect").Value<X>}
 */
const compileSanitizeClosure = (global) => {
  const {
    Object: { hasOwn },
    Reflect: { getPrototypeOf, setPrototypeOf, deleteProperty },
  } = global;
  return (closure) => {
    if (hasOwn(closure, "prototype")) {
      closure.prototype = null;
    }
    deleteProperty(closure, "length");
    deleteProperty(closure, "name");
    setPrototypeOf(closure, getPrototypeOf(closure));
    return /** @type {any} */ (closure);
  };
};

/**
 * @type {<X>(
 *   intrinsics: import("aran").AranIntrinsicRecord,
 *   lifecycle: import("./lifecycle").Lifecycle<X>,
 * ) => {
 *   library: import("./library").Library,
 *   advice: import("./advice").Advice<X>,
 * }}
 */
export const createRuntime = (intrinsics, { capture, release }) => {
  const global = intrinsics["aran.global"];
  const { internalizeReference, externalizeReference } = createMembrane(
    global,
    { capture, release },
  );
  const linvail = createLibrary(global);
  const { apply, construct } = compileCalling(
    global,
    extractAranLibrary(intrinsics),
    linvail,
    { capture, release },
    { internalizeReference, externalizeReference },
  );
  return {
    library: linvail,
    advice: {
      capture,
      release,
      internalize: (value) =>
        isPrimitive(value) ? value : internalizeReference(value),
      externalize: (value) =>
        isPrimitive(value) ? value : externalizeReference(value),
      sanitizeClosure: compileSanitizeClosure(global),
      apply,
      construct: (callee, args) => construct(callee, args, callee),
    },
  };
};
