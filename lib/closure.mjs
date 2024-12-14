import { isDataDescriptor } from "./proxy.mjs";
import { hasOwnNarrow, slice } from "./util.mjs";
import { isWrapper, unwrap, wrap } from "./wrapper.mjs";

const { Number, Array } = globalThis;

/**
 * @type {(
 *   array: import("./closure").InternalValue[],
 *   index: number,
 * ) => import("./closure").InternalValue}
 */
const at = (array, index) =>
  array.length > index ? array[index] : wrap(undefined);

/**
 * @type {(
 *   value: import("./closure").InternalValue,
 * ) => null | import("./closure").InternalReference}
 */
const toInternalReference = (value) => (isWrapper(value) ? null : value);

/**
 * @type {(
 *   value: import("./closure").InternalValue,
 * ) => boolean}
 */
const toBoolean = (value) => (isWrapper(value) ? !!unwrap(value) : true);

/**
 * @type {(
 *   value: import("./closure").InternalValue,
 *   leave: import("./closure").Leave,
 *   get: import("./closure").IntrinsicRecord["Reflect.get"],
 * ) => null | import("./closure").InternalValue[]}
 */
const toInternalArray = (value, leave, get) => {
  if (isWrapper(value)) {
    return null;
  } else {
    const length = Number(leave(get(value, "length", value)));
    const array = new Array(length);
    for (let index = 0; index < length; index++) {
      array[index] = get(value, index, value);
    }
    return array;
  }
};

/**
 * @type {(
 *   value: import("./closure").InternalValue,
 *   has: import("./closure").IntrinsicRecord["Reflect.has"],
 *   get: import("./closure").IntrinsicRecord["Reflect.get"],
 * ) => null | import("./closure").InternalDescriptor}
 */
const toInternalDescriptor = (value, has, get) => {
  if (isWrapper(value)) {
    return null;
  } else {
    if (has(value, "value")) {
      return {
        __proto__: null,
        value: get(value, "value", value),
        writable: toBoolean(get(value, "writable", value)),
        enumerable: toBoolean(get(value, "enumerable", value)),
        configurable: toBoolean(get(value, "configurable", value)),
      };
    } else {
      return {
        __proto__: null,
        get: toInternalReference(get(value, "get", value)) ?? undefined,
        set: toInternalReference(get(value, "set", value)) ?? undefined,
        enumerable: toBoolean(get(value, "enumerable", value)),
        configurable: toBoolean(get(value, "configurable", value)),
      };
    }
  }
};

/**
 * @type {(
 *   object: { __proto__: unknown } & {
 *    [key in string]: key extends "__proto__"
 *      ? null | import("./closure").InternalReference
 *      : import("./closure").InternalValue
 *   },
 * ) => import("./closure").InternalValue}
 */
const internalizeObject = (object) => /** @type {any} */ (object);

/**
 * @type {(
 *   value: undefined | import("./closure").InternalDescriptor,
 *   object_prototype: import("./closure").InternalReference,
 * ) => import("./closure").InternalValue}
 */
const internalizeDescriptor = (descriptor, object_prototype) => {
  if (descriptor == null) {
    return wrap(descriptor);
  } else {
    if (isDataDescriptor(descriptor)) {
      return internalizeObject({
        __proto__: object_prototype,
        value: descriptor.value,
        writable: wrap(descriptor.writable),
        enumerable: wrap(descriptor.enumerable),
        configurable: wrap(descriptor.configurable),
      });
    } else {
      return internalizeObject({
        __proto__: object_prototype,
        get: descriptor.get ?? wrap(undefined),
        set: descriptor.set ?? wrap(undefined),
        enumerable: wrap(descriptor.enumerable),
        configurable: wrap(descriptor.configurable),
      });
    }
  }
};

/**
 * @type {import("./closure").Application}
 */
export const application = {
  // Aran //
  "aran.get": (callee, _that, args, { enter, leave }) => {
    if (args.length === 0) {
      return callee(null, null);
    } else {
      const target = at(args, 0);
      const key = leave(at(args, 1));
      if (isWrapper(target)) {
        return enter(
          /**
           * @type {(
           *   target: import("./wrapper").Primitive,
           *   key: import("./closure").ExternalValue,
           * ) => import("./closure").ExternalValue}
           */ (callee)(unwrap(target), key),
        );
      } else {
        return callee(target, key);
      }
    }
  },
  "aran.createObject": (callee, that, args, { leave, intrinsics }) => {
    args[0] = /** @type {any} */ (toInternalReference(at(args, 0)));
    const { length } = args;
    for (let index = 1; index < length; index += 2) {
      args[index] = /** @type {any} */ (leave(at(args, index)));
      args[index + 1] = at(args, index + 1);
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
    { leave, intrinsics: { "Reflect.get": get } },
  ) =>
    callee(
      toInternalReference(at(args, 0)),
      at(args, 1),
      toInternalArray(at(args, 2), leave, get),
    ),
  "Reflect.construct": (
    callee,
    _that,
    args,
    { leave, intrinsics: { "Reflect.get": get } },
  ) =>
    callee(
      toInternalReference(at(args, 0)),
      toInternalArray(at(args, 1), leave, get),
      toInternalReference(at(args, args.length > 2 ? 2 : 0)),
    ),
  "Reflect.get": (callee, _that, args, { leave }) =>
    callee(toInternalReference(at(args, 0)), leave(at(args, 1)), at(args, 2)),
  "Reflect.set": (callee, _that, args, { leave }) =>
    wrap(
      callee(
        toInternalReference(at(args, 0)),
        leave(at(args, 1)),
        at(args, 2),
        at(args, 3),
      ),
    ),
  "Reflect.defineProperty": (
    callee,
    _that,
    args,
    { leave, intrinsics: { "Reflect.get": get, "Reflect.has": has } },
  ) =>
    wrap(
      callee(
        toInternalReference(at(args, 0)),
        leave(at(args, 1)),
        toInternalDescriptor(at(args, 2), has, get),
      ),
    ),
  "Reflect.getOwnPropertyDescriptor": (
    callee,
    _that,
    args,
    { leave, intrinsics, enterReference },
  ) =>
    internalizeDescriptor(
      callee(toInternalReference(at(args, 0)), leave(at(args, 1))),
      enterReference(intrinsics["Object.prototype"]),
    ),
  "Reflect.ownKeys": (callee, _that, args, { intrinsics, enterReference }) => {
    const array = /** @type {any} */ (callee(toInternalReference(at(args, 0))));
    const { length } = array;
    for (let index = 1; index < length; index++) {
      array[index] = wrap(array[index]);
    }
    intrinsics["Reflect.setPrototypeOf"](
      array,
      enterReference(intrinsics["Array.prototype"]),
    );
    return array;
  },
  // Array //
  "Array.of": (callee, that, args, { intrinsics, enterReference }) => {
    /** @type {import("./closure").InternalReference} */
    const array = /** @type {any} */ (intrinsics["Reflect.apply"])(
      callee,
      undefined,
      args,
    );
    intrinsics["Reflect.setPrototypeOf"](
      array,
      enterReference(intrinsics["Array.prototype"]),
    );
    return array;
  },
};
