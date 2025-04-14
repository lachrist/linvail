import { dir as dirNode } from "node:console";

const dir = (/** @type {unknown} */ value) => {
  dirNode(value, { showProxy: true, showHidden: true });
};

/**
 * @type {(
 *   options: {
 *     count: boolean,
 *   },
 * ) => Partial<import("../lib/runtime/config.d.ts").Config>}
 */
export const compileRuntimeConfig = ({ count }) => {
  if (count) {
    let count = 0;
    return {
      dir,
      wrapPrimitive: (primitive) => ({
        __proto__: null,
        type: "primitive",
        inner: primitive,
        index: count++,
      }),
      wrapGuestReference: (reference, apply, construct) => ({
        type: "guest",
        inner: reference,
        apply,
        construct,
        index: count++,
      }),
      wrapHostReference: (reference, kind) => ({
        type: "host",
        kind,
        inner: null,
        plain: reference,
        index: count++,
      }),
    };
  } else {
    return { dir };
  }
};
