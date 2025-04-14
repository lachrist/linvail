import { wrapFreshHostReference } from "./proxy.mjs";

/**
 * @type {(
 *   region: import("../region.d.ts").Region,
 *   length: number,
 * ) => import("../domain.d.ts").HostReferenceWrapper<"array">}
 */
export const createEmptyArray = (region, length) => {
  const { "global.Array": Array } = region;
  return wrapFreshHostReference(region, "array", new Array(length));
};

/**
 * @type {(
 *   region: import("../region.d.ts").Region,
 *   wrappers: import("../domain.d.ts").Wrapper[],
 * ) => import("../domain.d.ts").HostReferenceWrapper<"array">}
 */
export const createFullArray = (region, wrappers) => {
  const { "global.Array.of": toArray, "global.Reflect.apply": apply } = region;
  return wrapFreshHostReference(
    region,
    "array",
    apply(toArray, null, wrappers),
  );
};

/**
 * @type {(
 *   region: import("../region.d.ts").Region,
 *   prototype: null | import("../domain.d.ts").Reference,
 * ) => import("../domain.d.ts").HostReferenceWrapper<"object">}
 */
export const createEmptyObject = (region, prototype) => {
  const { "global.Object.create": createObject } = region;
  return wrapFreshHostReference(region, "object", createObject(prototype));
};

/**
 * @type {<K extends PropertyKey>(
 *   region: import("../region.d.ts").Region,
 *   literal: {
 *     [key in K]?: key extends "__proto__"
 *       ? (null | import("../domain.d.ts").Reference)
 *       : import("../domain.d.ts").Wrapper;
 *   },
 * ) => import("../domain.d.ts").HostReferenceWrapper<"object">}
 */
export const createFullObject = (region, literal) =>
  wrapFreshHostReference(region, "object", /** @type {any} */ (literal));
