/**
 * @type {(
 *   value: import("./wrapper").WrapperValue,
 * ) => import("./wrapper").WrapperHandle}
 */
export const wrap = (__inner) => ({ __inner });

/**
 * @type {(
 *   wrapper: import("./wrapper").WrapperHandle,
 * ) => import("./wrapper").WrapperValue}
 */
export const unwrap = ({ __inner }) => __inner;
