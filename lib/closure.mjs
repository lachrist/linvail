import { isDataDescriptor } from "./reflect.mjs";
import { hasOwnNarrow } from "./util.mjs";
import { isWrapper, unwrap, wrap, undefined } from "./wrapper.mjs";

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
 * ) => null | import("./closure").InternalDescriptor}
 */
const toInternalDescriptor = (value) => {
  if (isWrapper(value)) {
    return null;
  } else {
    if ("value" in value) {
      return {
        __proto__: null,
        value: value.value,
        writable: !!value.writable,
        enumerable: !!value.enumerable,
        configurable: !!value.configurable,
      };
    } else {
      return {
        __proto__: null,
        get: value.get,
        set: value.set,
        enumerable: !!value.enumerable,
        configurable: !!value.configurable,
      };
    }
  }
};

/**
 * @type {(
 *   value: undefined | import("./closure").InternalDescriptor,
 *   enterReference: (
 *     reference: import("./closure").ExternalReference,
 *   ) => import("./closure").InternalReference,
 *   intrinsics: {
 *     "Reflect.defineProperty": Function,
 *     "Reflect.setPrototypeOf": Function,
 *     "Object.prototype": import("./closure").ExternalReference,
 *   },
 * ) => import("./closure").InternalValue}
 */
const fromInternalDescriptor = (descriptor, enterReference, intrinsics) => {
  if (descriptor == null) {
    return wrap(descriptor);
  } else {
    if (isDataDescriptor(descriptor)) {
      return /** @type {any} */ ({
        __proto__: enterReference(intrinsics["Object.prototype"]),
        value: descriptor.value,
        writable: wrap(descriptor.writable),
        enumerable: wrap(descriptor.enumerable),
        configurable: wrap(descriptor.configurable),
      });
    } else {
      return /** @type {any} */ ({
        __proto__: enterReference(intrinsics["Object.prototype"]),
        get: descriptor.get,
        set: descriptor.set,
        enumerable: wrap(descriptor.enumerable),
        configurable: wrap(descriptor.configurable),
      });
    }
  }
};

/**
 * @type {(
 *   array: import("./closure").InternalValue[],
 *   index: number,
 *   leave: (
 *     value: import("./closure").InternalValue,
 *   ) => import("./closure").ExternalValue,
 * ) => import("./closure").ExternalValue}
 */
const atExternalValue = (array, index, leave) =>
  array.length <= index ? undefined : leave(array[index]);

/**
 * @type {import("./closure").Application}
 */
export const application = {
  // Aran //
  "aran.get": (callee, _that, args, { enter, leave }) => {
    if (args.length === 0) {
      return callee(null, null);
    } else {
      const target = args[0];
      if (isWrapper(target)) {
        return enter(
          /**
           * @type {(
           *   target: import("./wrapper").Primitive,
           *   key: import("./closure").ExternalValue,
           * ) => import("./closure").ExternalValue}
           */ (callee)(unwrap(target), atExternalValue(args, 1, leave)),
        );
      } else {
        return callee(target, atExternalValue(args, 1, leave));
      }
    }
  },
  "aran.createObject": (callee, that, args, {}) => {
    const prototype = args.length > 0 ? args[0] : null;
    const args2 = /** @type {[import("./membrane").ReferenceValue]} */ (args1);
  },
  // Reflect //
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
  "Reflect.has": (callee, _that, args, { leave }) =>
    wrap(callee(toInternalReference(at(args, 0)), leave(at(args, 1)))),
  "Reflect.defineProperty": (callee, _that, args, { leave }) =>
    wrap(
      callee(
        toInternalReference(at(args, 0)),
        leave(at(args, 1)),
        toInternalDescriptor(at(args, 2)),
      ),
    ),
  "Reflect.getOwnPropertyDescriptor": (callee, _that, args, { leave }) =>
    wrap(callee(toInternalReference(at(args, 0)), leave(at(args, 1)))),
  // Array //
  "Array.of": (callee, that, args, { intrinsics, enterReference }) => {
    const array = intrinsics["apply"](callee, undefined, args);
    intrinsics["Reflect.setPrototypeOf"](
      array,
      enterReference(intrinsics["Array.prototype"]),
    );
    return array;
  },
};
