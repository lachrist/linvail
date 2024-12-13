const {
  Symbol,
  Object: { hasOwn },
} = globalThis;

const __inner = Symbol("__inner");

/**
 * @type {(
 *   value: unknown,
 * ) => value is import("./wrapper").Wrapper}
 */
export const isWrapper = (value) =>
  typeof value === "object" && value !== null && hasOwn(value, __inner);

/**
 * @type {(
 *   primitive: import("./wrapper").Primitive,
 * ) => import("./wrapper").Wrapper}
 */
export const wrap = (primitive) =>
  /** @type {any} */ ({
    __proto__: null,
    [__inner]: primitive,
  });

/**
 * @type {(
 *   wrapper: import("./wrapper").Wrapper,
 * ) => import("./wrapper").Primitive}
 */
export const unwrap = (wrapper) => /** @type {any} */ (wrapper)[__inner];
