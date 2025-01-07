/**
 * @type {(
 *   global: typeof globalThis,
 * ) => import("./global").Global}
 */
export const cloneGlobal = ({
  undefined,
  TypeError,
  Error,
  Reflect,
  Object,
  Array,
}) => {
  /** @type {import("./global").Skeleton<import("./global").Global>} */
  const global = {
    undefined,
    TypeError,
    Error,
    Reflect: {
      ...Reflect,
    },
    Object: { __self: Object, ...Object },
    Array: { __self: Array, ...Array },
  };
  return /** @type {import("./global").Global} */ (global);
};
