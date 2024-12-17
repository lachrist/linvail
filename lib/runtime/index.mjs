import { createMembrane } from "./membrane.mjs";
import { isPrimitive } from "./reflect.mjs";

const {
  Object: { hasOwn },
  Reflect: { getPrototypeOf, setPrototypeOf, deleteProperty },
} = globalThis;

/**
 * @type {<X>(
 *   closure: Function,
 * ) => import("./reflect").Value<X>}
 */
const sanitizeClosure = (closure) => {
  if (hasOwn(closure, "prototype")) {
    closure.prototype = null;
  }
  deleteProperty(closure, "length");
  deleteProperty(closure, "name");
  setPrototypeOf(closure, getPrototypeOf(closure));
  return /** @type {any} */ (closure);
};

/**
 * @type {<X>(
 *   intrinsics: import("./intrinsic").IntrinsicRecord,
 *   lifecycle: import("./lifecycle").Lifecycle<X>,
 * ) => import("./advice").Advice<X>}
 */
export const createAdvice = (intrinsics, { capture, release }) => {
  const { internalizeReference, externalizeReference } = createMembrane(
    intrinsics,
    {
      capture,
      release,
    },
  );
  return {
    capture,
    release,
    internalize: (value) =>
      isPrimitive(value) ? value : internalizeReference(value),
    externalize: (value) =>
      isPrimitive(value) ? value : externalizeReference(value),
    sanitizeClosure,
    apply: TODO,
    construct: TODO,
  };
};
