// some manual cloning because many non-enumerable properties
// eg: {...Reflect} = {}

/**
 * @type {(
 *   library: import("aran").IntrinsicRecord,
 * ) => import("./global").Skeleton<
 *   import("./global").Global["Aran"],
 *   unknown,
 * >}
 */
const cloneAran = ({
  "aran.sliceObject": sliceObject,
  "aran.getValueProperty": getValueProperty,
  "aran.listForInKey": listForInKey,
  "aran.createObject": createObject,
}) => ({
  sliceObject,
  getValueProperty,
  listForInKey,
  createObject,
});

/**
 * @type {(
 *   library: typeof Reflect,
 * ) => typeof Reflect}
 */
const cloneReflect = ({
  apply,
  construct,
  getPrototypeOf,
  setPrototypeOf,
  defineProperty,
  has,
  get,
  set,
  isExtensible,
  getOwnPropertyDescriptor,
  preventExtensions,
  deleteProperty,
  ownKeys,
}) => ({
  apply,
  construct,
  getPrototypeOf,
  setPrototypeOf,
  isExtensible,
  preventExtensions,
  defineProperty,
  deleteProperty,
  getOwnPropertyDescriptor,
  ownKeys,
  has,
  get,
  set,
});

/**
 * @type {(
 *   library: typeof console,
 * ) => import("./global").Skeleton<
 *   import("./global").Global["console"],
 *   unknown,
 * >}
 */
const cloneConsole = ({ dir }) => ({ dir });

/**
 * @type {(
 *   library: typeof Object,
 * ) => import("./global").Skeleton<
 *   import("./global").Global["Object"],
 *   unknown,
 * >}
 */
const cloneObject = (Object) => {
  const {
    prototype,
    hasOwn,
    create,
    setPrototypeOf,
    getPrototypeOf,
    defineProperty,
    getOwnPropertyDescriptor,
  } = Object;
  return {
    __self: Object,
    hasOwn,
    create,
    setPrototypeOf,
    getPrototypeOf,
    defineProperty,
    getOwnPropertyDescriptor,
    prototype: {
      __self: prototype,
    },
  };
};

/**
 * @type {(
 *   library: typeof Array,
 * ) => import("./global").Skeleton<
 *   import("./global").Global["Array"],
 *   unknown,
 * >}
 */
const cloneArray = (Array) => {
  const { of, prototype } = Array;
  return {
    __self: Array,
    of,
    prototype: {
      __self: prototype,
    },
  };
};

/**
 * @type {(
 *   library: typeof Function,
 * ) => import("./global").Skeleton<
 *   import("./global").Global["Function"],
 *   unknown,
 * >}
 */
const cloneFunction = (Function) => {
  const { prototype } = Function;
  return {
    prototype: {
      __self: prototype,
    },
  };
};

/**
 * @type {(
 *   library: typeof Number,
 * ) => import("./global").Skeleton<
 *   import("./global").Global["Number"],
 *   unknown,
 * >}
 */
const cloneNumber = (Number) => ({
  __self: Number,
});

/**
 * @type {(
 *   record: import("aran").IntrinsicRecord,
 * ) => import("./global").Global}
 */
export const cloneGlobal = (Aran) => {
  const {
    console,
    undefined,
    Function,
    TypeError,
    Error,
    Reflect,
    Object,
    Array,
    Number,
  } = Aran["aran.global_object"];
  /**
   * @type {import("./global").Skeleton<
   *   import("./global").Global,
   *   unknown,
   * >}
   */
  const global = {
    undefined,
    TypeError,
    Error,
    Aran: cloneAran(Aran),
    Number: cloneNumber(Number),
    console: cloneConsole(console),
    Function: cloneFunction(Function),
    Reflect: cloneReflect(Reflect),
    Object: cloneObject(Object),
    Array: cloneArray(Array),
  };
  return /** @type {import("./global").Global} */ (global);
};
