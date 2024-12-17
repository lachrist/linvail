const {
  Reflect: { apply },
} = globalThis;

const applyIntrinsic = /** @type {import("./intrinsic").Apply} */ (
  /** @type {unknown} */ (apply)
);

/**
 * @type {(
 *   array: (import("./shadow").Value | undefined)[],
 *   index: number,
 * ) => import("./shadow").Value}
 */
const at = (array, index) =>
  index < array.length
    ? /** @type {import("./shadow").Value} */ (array[index])
    : { type: "Primitive", primitive: undefined };

/**
 * @type {(
 *   callback: import("./shadow").Value,
 * ) => (
 *   success: import("./shadow").Value,
 * ) => { __brand: "InnerPromise" }}
 */
const toShadowSuccessCallback = TODO;

/**
 * @type {(
 *   callback: import("./shadow").Value,
 * ) => (
 *   success: import("./actual").Value,
 * ) => { __brand: "InnerPromise" }}
 */
const toActualSuccessCallback = TODO;

/**
 * @type {(
 *   callback: import("./shadow").Value,
 * ) => (
 *   failure: import("./actual").Value,
 * ) => { __brand: "InnerPromise" }}
 */
const toActualFailureCallback = TODO;

/**
 * @type {import("./intrinsic").ApplyIntrinsicRecord}
 */
export const apply_intrinsic_record = {
  "Promise.prototype.then": (callee, that, args, { toShadow, toActual }) => {
    if (that.type === "Promise") {
      return {
        type: "Promise",
        inner: applyIntrinsic(callee, that.inner, [
          toShadowSuccessCallback(at(args, 0)),
          toActualFailureCallback(at(args, 1)),
        ]),
        outer: null,
      };
    }
    return {
      type: "Promise",
      inner: applyIntrinsic(callee, toActual(that), [
        toActualSuccessCallback(at(args, 0)),
        toActualFailureCallback(at(args, 1)),
      ]),
      outer: null,
    };
  },
};
