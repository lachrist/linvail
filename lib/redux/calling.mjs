/**
 * @type {(
 *   region: import("./region").Region,
 *   global: typeof globalThis,
 *   aran: import("./aran").AranLibrary,
 *   linvail: import("./library").Linvail,
 * ) => {
 *   apply: (
 *     callee: import("./domain").InternalValue,
 *     that: import("./domain").InternalValue,
 *     args: import("./domain").InternalValue[],
 *   ) => import("./domain").InternalValue,
 *   construct: (
 *     callee: import("./domain").InternalValue,
 *     args: import("./domain").InternalValue[],
 *     new_target: import("./domain").InternalValue,
 *   ) => import("./domain").InternalReference,
 * }}
 */
export const compileCalling = (_region, _global, _aran, _linvail) => TODO;
