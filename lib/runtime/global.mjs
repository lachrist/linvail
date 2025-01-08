/**
 * @type {(
 *   record: import("aran/lib/lang/syntax").AranIntrinsicRecord,
 * ) => import("./global").Global}
 */
export const cloneGlobal = ({
  "aran.global": {
    Proxy,
    console,
    undefined,
    Function,
    TypeError,
    Error,
    Reflect,
    Object,
    Array,
  },
  "aran.sliceObject": sliceObject,
  "aran.get": get,
  "aran.listForInKey": listForInKey,
  "aran.createObject": createObject,
}) => {
  /**
   * @type {import("./global").Skeleton<
   *   import("./global").Global,
   *   unknown,
   * >}
   */
  const global = {
    __Aran: {
      sliceObject,
      get,
      listForInKey,
      createObject,
    },
    Proxy,
    undefined,
    TypeError,
    Error,
    console: {
      ...console,
    },
    Function: {
      prototype: {
        __self: Function.prototype,
      },
    },
    Reflect: {
      ...Reflect,
    },
    Object: {
      ...Object,
      __self: Object,
      prototype: {
        ...Object.prototype,
        __self: Object.prototype,
      },
    },
    Array: {
      ...Array,
      __self: Array,
      prototype: {
        ...Array.prototype,
        __self: Array.prototype,
      },
    },
  };
  return /** @type {import("./global").Global} */ (global);
};
