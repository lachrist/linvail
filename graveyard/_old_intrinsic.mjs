// @ts-nocheck

import { isDataDescriptor } from "./reflect.mjs";

const {
  Number,
  Array,
  undefined,
  Reflect: { apply, getPrototypeOf, setPrototypeOf },
} = globalThis;

/**
 * @type {<X>(
 *   array: X[],
 *   internalizeReference: (
 *     value: import("../lib/runtime/reflect").RawReference,
 *   ) => import("../lib/runtime/reflect").Reference<X>,
 * ) => import("../lib/runtime/reflect").Reference<X>}
 */
const internalizeArray = (array, internalizeReference) => {
  const prototype = /** @type {null | import("../lib/runtime/reflect").RawReference} */ (
    getPrototypeOf(array)
  );
  if (prototype !== null) {
    setPrototypeOf(array, internalizeReference(prototype));
  }
  return /** @type {any} */ (array);
};

/**
 * @type {<X>(
 *   value: import("../lib/runtime/reflect").Value<X>,
 * ) => boolean}
 */
const toBoolean = (value) => !!value;

/**
 * @type {<X>(
 *   handle: X,
 *   get: import("../lib/runtime/reflect").Reflect["get"],
 *   externalizeReference: (
 *     value: import("../lib/runtime/reflect").Reference<X>,
 *   ) => import("../lib/runtime/reflect").RawReference,
 *   release: (handle: X) => import("../lib/runtime/reflect").Value<X>,
 * ) => X[]}
 */
const listHandle = (handle, get, externalizeReference, release) => {
  const length = Number(
    leave(
      release(get(release(handle), "length", handle)),
      externalizeReference,
    ),
  );
  const handles = new Array(length);
  for (let index = 0; index < length; index++) {
    handles[index] = get(release(handle), index, handle);
  }
  return handles;
};

/**
 * @type {<X>(
 *   handle: X,
 *   has: import("../lib/runtime/reflect").Reflect["has"],
 *   get: import("../lib/runtime/reflect").Reflect["get"],
 *   release: (handle: X) => import("../lib/runtime/reflect").Value<X>,
 * ) => import("../lib/runtime/reflect").Descriptor<X>}
 */
const toDescriptor = (handle, has, get, release) => {
  const value = release(handle);
  if (has(value, "value")) {
    return {
      __proto__: null,
      value: get(value, "value", handle),
      writable: toBoolean(release(get(value, "writable", handle))),
      enumerable: toBoolean(release(get(value, "enumerable", handle))),
      configurable: toBoolean(release(get(value, "configurable", handle))),
    };
  } else {
    return {
      __proto__: null,
      get: release(get(value, "get", handle)),
      set: release(get(value, "set", handle)),
      enumerable: toBoolean(release(get(value, "enumerable", handle))),
      configurable: toBoolean(release(get(value, "configurable", handle))),
    };
  }
};

/**
 * @type {<X>(
 *   value: undefined | import("../lib/runtime/reflect").Descriptor<X>,
 *   object_prototype: import("../lib/runtime/reflect").Reference<X>,
 *   capture: (value: import("../lib/runtime/reflect").Value<X>) => X,
 * ) => undefined | import("../lib/runtime/reflect").Reference<X>}
 */
const internalizeReferenceDescriptor = (
  descriptor,
  object_prototype,
  capture,
) => {
  if (descriptor == null) {
    return undefined;
  } else {
    if (isDataDescriptor(descriptor)) {
      return /** @type {any} */ ({
        __proto__: object_prototype,
        value: descriptor.value,
        writable: capture(descriptor.writable),
        enumerable: capture(descriptor.enumerable),
        configurable: capture(descriptor.configurable),
      });
    } else {
      return /** @type {any} */ ({
        __proto__: object_prototype,
        get: capture(descriptor.get),
        set: capture(descriptor.set),
        enumerable: capture(descriptor.enumerable),
        configurable: capture(descriptor.configurable),
      });
    }
  }
};

/**
 * @type {import("../lib/runtime/global").ApplyIntrinsicRecord}
 */
export const apply_intrinsic_record = {
  // Aran //
  "aran.get": (callee, _that, args, { release, externalizeReference }) =>
    callee(
      atValue(args, 0, release),
      leave(atValue(args, 1, release), externalizeReference),
    ),
  "aran.createObject": (
    callee,
    that,
    args,
    { intrinsics, capture, release, externalizeReference },
  ) => {
    args[0] = /** @type {any} */ (atValue(args, 0, release));
    const { length } = args;
    for (let index = 1; index < length; index += 2) {
      args[index] = /** @type {any} */ (
        leave(atValue(args, index, release), externalizeReference)
      );
      args[index + 1] = atHandle(args, index + 1, capture);
    }
    return capture(apply(callee, undefined, args));
  },
  // Linvail //
  "Linvail.same": (callee, _that, args, { capture }) =>
    capture(callee(atHandle(args, 0, capture), atHandle(args, 1, capture))),
  // Reflect //
  "Reflect.apply": (
    callee,
    _that,
    args,
    {
      capture,
      release,
      externalizeReference,
      intrinsics: { "Reflect.get": get },
    },
  ) =>
    callee(
      atValue(args, 0, release),
      atHandle(args, 1, capture),
      listHandle(
        atHandle(args, 2, capture),
        get,
        externalizeReference,
        release,
      ),
    ),
  "Reflect.construct": (
    callee,
    _that,
    args,
    {
      release,
      externalizeReference,
      capture,
      intrinsics: { "Reflect.get": get },
    },
  ) =>
    capture(
      callee(
        atValue(args, 0, release),
        listHandle(
          atHandle(args, 2, capture),
          get,
          externalizeReference,
          release,
        ),
        atValue(args, args.length > 2 ? 2 : 0, release),
      ),
    ),
  "Reflect.get": (
    callee,
    _that,
    args,
    { capture, release, externalizeReference },
  ) =>
    callee(
      atValue(args, 0, release),
      leave(atValue(args, 1, release), externalizeReference),
      atHandle(args, args.length > 2 ? 2 : 0, capture),
    ),
  "Reflect.set": (
    callee,
    _that,
    args,
    { capture, release, externalizeReference },
  ) =>
    capture(
      callee(
        atValue(args, 0, release),
        leave(atValue(args, 1, release), externalizeReference),
        atHandle(args, 2, capture),
        atHandle(args, args.length > 2 ? 2 : 0, capture),
      ),
    ),
  "Reflect.defineProperty": (
    callee,
    _that,
    args,
    {
      capture,
      release,
      externalizeReference,
      intrinsics: { "Reflect.get": get, "Reflect.has": has },
    },
  ) =>
    capture(
      callee(
        atValue(args, 0, release),
        leave(atValue(args, 1, release), externalizeReference),
        toDescriptor(atHandle(args, 2, capture), has, get, release),
      ),
    ),
  "Reflect.getOwnPropertyDescriptor": (
    callee,
    _that,
    args,
    {
      capture,
      release,
      internalizeReference,
      externalizeReference,
      intrinsics,
    },
  ) =>
    capture(
      internalizeReferenceDescriptor(
        callee(
          atValue(args, 0, release),
          leave(atValue(args, 1, release), externalizeReference),
        ),
        internalizeReference(intrinsics["Object.prototype"]),
        capture,
      ),
    ),
  "Reflect.ownKeys": (
    callee,
    _that,
    args,
    { capture, release, internalizeReference, intrinsics },
  ) => {
    const array = /** @type {any[]} */ (callee(atValue(args, 0, release)));
    const { length } = array;
    for (let index = 1; index < length; index++) {
      array[index] = /** @type  */ capture(array[index]);
    }
    return capture(internalizeArray(array, internalizeReference));
  },
  // Array //
  "Array.of": (
    callee,
    _that,
    args,
    { capture, internalizeReference: internalizeReference },
  ) =>
    capture(
      internalizeArray(apply(callee, undefined, args), internalizeReference),
    ),
};
