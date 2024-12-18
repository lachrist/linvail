/**
 * @type {<X>(
 *   global: typeof globalThis,
 *   aran: import("./aran").AranLibrary,
 *   linvail: import("./library").Library,
 *   lifecycle: import("./lifecycle").Lifecycle<X>,
 *   membrane: import("./membrane").Membrane<X, import("./reflect").RawValue>,
 * ) => {
 *   apply: (callee: X, that: X, args: X[]) => X;
 *   construct: (callee: X, args: X[], new_target: X) => X;
 * }}
 */
export const compileCalling = (
  global,
  aran,
  linvail,
  { capture, release },
  { internalizeReference, externalizeReference },
) => TODO;
