import { isDataDescriptor, isPrimitive } from "./reflect.mjs";

const { Number, Array, undefined } = globalThis;

/**
 * @type {<X, Y>(
 *   value: import("./reflect").Value<X>,
 *   convertReference: (
 *     value: import("./reflect").Reference<X>,
 *   ) => import("./reflect").Reference<Y>,
 * ) => import("./reflect").Value<Y>}
 */
const convert = (value, convertReference) =>
  isPrimitive(value) ? value : convertReference(value);

/**
 * @type {<X>(
 *   value: import("./reflect").Value<X>,
 *   externalize: (
 *     value: import("./reflect").Reference<X>,
 *   ) => import("./reflect").RawReference,
 * ) => import("./reflect").RawValue}
 */
const leave = convert;

/**
 * @type {<X>(
 *   value: import("./reflect").RawValue,
 *   internalize: (
 *     value: import("./reflect").RawReference,
 *   ) => import("./reflect").Reference<X>,
 * ) => import("./reflect").Value<X>}
 */
const enter = convert;

/**
 * @type {<X>(
 *   array: X[],
 *   index: number,
 *   declare: (value: import("./reflect").Value<X>) => X,
 * ) => X}
 */
const atHandle = (array, index, declare) =>
  array.length > index ? array[index] : declare(undefined);

/**
 * @type {<X>(
 *   array: X[],
 *   index: number,
 *   access: (handle: X) => import("./reflect").Value<X>,
 * ) => import("./reflect").Value<X>}
 */
const atValue = (array, index, access) =>
  array.length > index ? access(array[index]) : undefined;

/**
 * @type {<X>(
 *   value: import("./reflect").Value<X>,
 * ) => boolean}
 */
const toBoolean = (value) => !!value;

/**
 * @type {<X>(
 *   handle: X,
 *   get: import("./reflect").Reflect["get"],
 *   externalize: (
 *     value: import("./reflect").Reference<X>,
 *   ) => import("./reflect").RawReference,
 *   access: (handle: X) => import("./reflect").Value<X>,
 * ) => X[]}
 */
const listHandle = (handle, get, externalize, access) => {
  const length = Number(
    leave(access(get(access(handle), "length", handle)), externalize),
  );
  const handles = new Array(length);
  for (let index = 0; index < length; index++) {
    handles[index] = get(access(handle), index, handle);
  }
  return handles;
};

/**
 * @type {<X>(
 *   handle: X,
 *   has: import("./reflect").Reflect["has"],
 *   get: import("./reflect").Reflect["get"],
 *   access: (handle: X) => import("./reflect").Value<X>,
 * ) => import("./reflect").Descriptor<X>}
 */
const toDescriptor = (handle, has, get, access) => {
  const value = access(handle);
  if (has(value, "value")) {
    return {
      __proto__: null,
      value: get(value, "value", handle),
      writable: toBoolean(access(get(value, "writable", handle))),
      enumerable: toBoolean(access(get(value, "enumerable", handle))),
      configurable: toBoolean(access(get(value, "configurable", handle))),
    };
  } else {
    return {
      __proto__: null,
      get: access(get(value, "get", handle)),
      set: access(get(value, "set", handle)),
      enumerable: toBoolean(access(get(value, "enumerable", handle))),
      configurable: toBoolean(access(get(value, "configurable", handle))),
    };
  }
};

/**
 * @type {<X>(
 *   value: undefined | import("./reflect").Descriptor<X>,
 *   object_prototype: import("./reflect").Reference<X>,
 *   declare: (value: import("./reflect").Value<X>) => X,
 * ) => undefined | import("./reflect").Reference<X>}
 */
const internalizeDescriptor = (descriptor, object_prototype, declare) => {
  if (descriptor == null) {
    return undefined;
  } else {
    if (isDataDescriptor(descriptor)) {
      return /** @type {any} */ ({
        __proto__: object_prototype,
        value: descriptor.value,
        writable: declare(descriptor.writable),
        enumerable: declare(descriptor.enumerable),
        configurable: declare(descriptor.configurable),
      });
    } else {
      return /** @type {any} */ ({
        __proto__: object_prototype,
        get: declare(descriptor.get),
        set: declare(descriptor.set),
        enumerable: declare(descriptor.enumerable),
        configurable: declare(descriptor.configurable),
      });
    }
  }
};

/**
 * @type {import("./intrinsic").Application}
 */
export const application = {
  // Aran //
  "aran.get": (callee, _that, args, { access, externalize }) =>
    callee(
      atValue(args, 0, access),
      leave(atValue(args, 1, access), externalize),
    ),
  "aran.createObject": (
    callee,
    that,
    args,
    { intrinsics, declare, access, externalize },
  ) => {
    args[0] = /** @type {any} */ (atValue(args, 0, access));
    const { length } = args;
    for (let index = 1; index < length; index += 2) {
      args[index] = /** @type {any} */ (
        leave(atValue(args, index, access), externalize)
      );
      args[index + 1] = atHandle(args, index + 1, declare);
    }
    return /** @type {any} */ (intrinsics["Reflect.apply"])(
      callee,
      undefined,
      args,
    );
  },
  // Reflect //
  "Reflect.apply": (
    callee,
    _that,
    args,
    { declare, access, externalize, intrinsics: { "Reflect.get": get } },
  ) =>
    callee(
      atValue(args, 0, access),
      atHandle(args, 1, declare),
      listHandle(atHandle(args, 2, declare), get, externalize, access),
    ),
  "Reflect.construct": (
    callee,
    _that,
    args,
    { access, externalize, declare, intrinsics: { "Reflect.get": get } },
  ) =>
    declare(
      callee(
        atValue(args, 0, access),
        listHandle(atHandle(args, 2, declare), get, externalize, access),
        atValue(args, args.length > 2 ? 2 : 0, access),
      ),
    ),
  "Reflect.get": (callee, _that, args, { declare, access, externalize }) =>
    callee(
      atValue(args, 0, access),
      leave(atValue(args, 1, access), externalize),
      atHandle(args, args.length > 2 ? 2 : 0, declare),
    ),
  "Reflect.set": (callee, _that, args, { declare, access, externalize }) =>
    declare(
      callee(
        atValue(args, 0, access),
        leave(atValue(args, 1, access), externalize),
        atHandle(args, 2, declare),
        atHandle(args, args.length > 2 ? 2 : 0, declare),
      ),
    ),
  "Reflect.defineProperty": (
    callee,
    _that,
    args,
    {
      declare,
      access,
      externalize,
      intrinsics: { "Reflect.get": get, "Reflect.has": has },
    },
  ) =>
    declare(
      callee(
        atValue(args, 0, access),
        leave(atValue(args, 1, access), externalize),
        toDescriptor(atHandle(args, 2, declare), has, get, access),
      ),
    ),
  "Reflect.getOwnPropertyDescriptor": (
    callee,
    _that,
    args,
    { declare, access, internalize, externalize, intrinsics },
  ) =>
    declare(
      internalizeDescriptor(
        callee(
          atValue(args, 0, access),
          leave(atValue(args, 1, access), externalize),
        ),
        internalize(intrinsics["Object.prototype"]),
        declare,
      ),
    ),
  "Reflect.ownKeys": (
    callee,
    _that,
    args,
    { declare, access, internalize, intrinsics },
  ) => {
    const array = /** @type {any} */ (callee(atValue(args, 0, access)));
    const { length } = array;
    for (let index = 1; index < length; index++) {
      array[index] = declare(array[index]);
    }
    intrinsics["Reflect.setPrototypeOf"](
      array,
      internalize(intrinsics["Array.prototype"]),
    );
    return array;
  },
  // Array //
  "Array.of": (callee, _that, args, { internalize, intrinsics }) => {
    const array = /** @type {any} */ (intrinsics["Reflect.apply"])(
      callee,
      undefined,
      args,
    );
    intrinsics["Reflect.setPrototypeOf"](
      array,
      internalize(intrinsics["Array.prototype"]),
    );
    return array;
  },
};
