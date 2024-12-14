import { isDataDescriptor, isPrimitive } from "./reflect.mjs";
import { hasOwnNarrow } from "./util.mjs";

const {
  Reflect: { apply },
  WeakMap,
  WeakMap: {
    prototype: { has: hasWeakMap, get: getWeakMap, set: setWeakMap },
  },
} = globalThis;

/**
 * @type {<X, Y>(
 *   descriptor: import("./reflect").Descriptor<X>,
 *   convertValue: (value: X) => Y,
 *   convertReference: (
 *     value: import("./reflect").Reference<X>,
 *   ) => import("./reflect").Reference<Y>,
 * ) => import("./reflect").Descriptor<Y>}
 */
export const convertDescriptor = (
  descriptor,
  convertValue,
  convertReference,
) =>
  isDataDescriptor(descriptor)
    ? {
        __proto__: null,
        value: convertValue(descriptor.value),
        writable: descriptor.writable,
        enumerable: descriptor.enumerable,
        configurable: descriptor.configurable,
      }
    : {
        __proto__: null,
        get: descriptor.get ? convertReference(descriptor.get) : undefined,
        set: descriptor.set ? convertReference(descriptor.set) : undefined,
        enumerable: descriptor.enumerable,
        configurable: descriptor.configurable,
      };

/**
 * @template I
 * @template E
 * @param {import("./intrinsic").IntrinsicRecord} intrinsics
 * @param {import("./membrane").Membrane<I, E>} membrane
 * @returns {import("./membrane").ProxyHandler<I, E>}
 */
const createProxyHandler = (
  intrinsics,
  { enter, leave, enterReference, leaveReference },
) => ({
  apply: (target, that, args1) => {
    const { length } = args1;
    /** @type {I[]} */
    const args2 = new Array(length);
    for (let index = 0; index < length; index += 1) {
      args2[index] = enter(args1[index]);
    }
    return leave(intrinsics["Reflect.apply"](target, enter(that), args2));
  },
  construct: (target, args1, new_target) => {
    const { length } = args1;
    /** @type {I[]} */
    const args2 = new Array(length);
    for (let index = 0; index < length; index += 1) {
      args2[index] = enter(args1[index]);
    }
    return leaveReference(
      intrinsics["Reflect.construct"](
        target,
        args2,
        enterReference(new_target),
      ),
    );
  },
  getPrototypeOf: (target) => {
    const prototype = intrinsics["Reflect.getPrototypeOf"](target);
    return prototype === null ? null : leaveReference(prototype);
  },
  setPrototypeOf: (target, prototype) =>
    intrinsics["Reflect.setProtoypeOf"](
      target,
      prototype === null ? null : enterReference(prototype),
    ),
  getOwnPropertyDescriptor: (target, key) => {
    const descriptor = intrinsics["Reflect.getOwnPropertyDescriptor"](
      target,
      key,
    );
    return descriptor == null
      ? undefined
      : convertDescriptor(descriptor, leave, leaveReference);
  },
  defineProperty: (target, key, descriptor) =>
    intrinsics["Reflect.defineProperty"](
      target,
      key,
      convertDescriptor(descriptor, enter, enterReference),
    ),
  get: (target, key, receiver) => {
    /** @type {null | import("./reflect").Reference<I>} */
    let current = target;
    while (current !== null) {
      const descriptor = intrinsics["Reflect.getOwnPropertyDescriptor"](
        current,
        key,
      );
      if (descriptor != null) {
        if (hasOwnNarrow(descriptor, "value")) {
          return leave(descriptor.value);
        }
        if (descriptor.get) {
          return leave(
            intrinsics["Reflect.apply"](descriptor.get, enter(receiver), []),
          );
        }
        return undefined;
      }
      current = intrinsics["Reflect.getPrototypeOf"](current);
    }
    return undefined;
  },
  set: (target, key, value, receiver) => {
    /** @type {null | import("./reflect").Reference<I>} */
    let current = target;
    while (current !== null) {
      const descriptor = intrinsics["Reflect.getOwnPropertyDescriptor"](
        current,
        key,
      );
      if (descriptor != null) {
        if (isDataDescriptor(descriptor)) {
          descriptor.value = enter(value);
          return intrinsics["Reflect.defineProperty"](current, key, descriptor);
        }
        if (descriptor.set) {
          intrinsics["Reflect.apply"](descriptor.set, enter(receiver), [
            enter(value),
          ]);
          return true;
        }
        return false;
      }
      current = intrinsics["Reflect.getPrototypeOf"](current);
    }
    return intrinsics["Reflect.defineProperty"](target, key, {
      __proto__: null,
      value: enter(value),
      writable: true,
      enumerable: true,
      configurable: true,
    });
  },
});

/**
 * @type {<I, O>(
 *   intrinsics: import("./intrinsic").IntrinsicRecord,
 *   membrane: import("./membrane").Membrane<I, O>,
 * ) => (
 *   reference: import("./reflect").Reference<I>,
 * ) => import("./reflect").Reference<O>}
 */
const compileProxify = (intrinsics, membrane) => {
  const { Proxy } = intrinsics;
  const handler = createProxyHandler(intrinsics, membrane);
  return (reference) => new Proxy(reference, handler);
};

/**
 * @template X
 * @param {import("./intrinsic").IntrinsicRecord} intrinsics
 * @param {import("./membrane").Region<X>} region
 * @return {import("./membrane").Membrane<X, import("./reflect").RawValue>}
 */
export const createMembrane = (intrinsics, { convert, revert }) => {
  /**
   * @type {WeakMap<
   *   import("./reflect").Reference<X>,
   *   import("./reflect").RawReference
   * >}
   */
  const externals = new WeakMap();
  /**
   * @type {WeakMap<
   *   import("./reflect").RawReference,
   *   import("./reflect").Reference<X>
   * >}
   */
  const internals = new WeakMap();
  /**
   * @type {(
   *   reference: import("./reflect").RawReference,
   * ) => import("./reflect").Reference<X>}
   */
  const enterReference = (reference) => {
    if (apply(hasWeakMap, internals, [reference])) {
      return apply(getWeakMap, internals, [reference]);
    } else {
      const proxy = toInternalProxy(reference);
      apply(setWeakMap, internals, [reference, proxy]);
      apply(setWeakMap, externals, [proxy, reference]);
      return proxy;
    }
  };
  /**
   * @type {(
   *   value: import("./reflect").Reference<X>,
   * ) => import("./reflect").RawReference}
   */
  const leaveReference = (value) => {
    if (apply(hasWeakMap, internals, [value])) {
      return apply(getWeakMap, internals, [value]);
    } else {
      const proxy = toExternalProxy(value);
      apply(setWeakMap, externals, [value, proxy]);
      apply(setWeakMap, internals, [proxy, value]);
      return proxy;
    }
  };
  /**
   * @type {(value: import("./reflect").RawValue) => X}
   */
  const enter = (value) =>
    convert(isPrimitive(value) ? value : enterReference(value));
  /**
   * @type {(inner: X) => import("./reflect").RawValue}
   */
  const leave = (inner) => {
    const value = revert(inner);
    return isPrimitive(value) ? value : leaveReference(value);
  };
  const forward_membrane = {
    enter,
    leave,
    enterReference,
    leaveReference,
  };
  const backward_membrane = {
    enter: leave,
    leave: enter,
    enterReference: leaveReference,
    leaveReference: enterReference,
  };
  const toExternalProxy = compileProxify(intrinsics, forward_membrane);
  const toInternalProxy = compileProxify(intrinsics, backward_membrane);
  return forward_membrane;
};
