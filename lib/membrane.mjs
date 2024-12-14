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
 *   value: import("./reflect").Value<X>,
 *   convertReference: (
 *     value: import("./reflect").Reference<X>,
 *   ) => import("./reflect").Reference<Y>,
 * ) => undefined | import("./reflect").Reference<Y>}
 */
const toReference = (value, convertReference) =>
  isPrimitive(value) ? undefined : convertReference(value);

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
        get: toReference(descriptor.get, convertReference),
        set: toReference(descriptor.set, convertReference),
        enumerable: descriptor.enumerable,
        configurable: descriptor.configurable,
      };

/**
 * @template I
 * @template E
 * @param {import("./intrinsic").IntrinsicRecord} intrinsics
 * @param {import("./membrane").Region<I, E>} region
 * @param {import("./membrane").Membrane<I, E>} membrane
 * @returns {import("./membrane").ProxyHandler<I, E>}
 */
const createProxyHandler = (
  intrinsics,
  { enter, leave },
  { internalize, externalize },
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
    return externalize(
      intrinsics["Reflect.construct"](target, args2, internalize(new_target)),
    );
  },
  getPrototypeOf: (target) => {
    const prototype = intrinsics["Reflect.getPrototypeOf"](target);
    return prototype === null ? null : externalize(prototype);
  },
  setPrototypeOf: (target, prototype) =>
    intrinsics["Reflect.setPrototypeOf"](
      target,
      prototype === null ? null : internalize(prototype),
    ),
  getOwnPropertyDescriptor: (target, key) => {
    const descriptor = intrinsics["Reflect.getOwnPropertyDescriptor"](
      target,
      key,
    );
    return descriptor == null
      ? undefined
      : convertDescriptor(descriptor, leave, externalize);
  },
  defineProperty: (target, key, descriptor) =>
    intrinsics["Reflect.defineProperty"](
      target,
      key,
      convertDescriptor(descriptor, enter, internalize),
    ),
  get: (target, key, receiver) => {
    /** @type {import("./reflect").Value<I>} */
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
    /** @type {import("./reflect").Value<I>} */
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
 *   region: import("./membrane").Region<I, O>,
 *   membrane: import("./membrane").Membrane<I, O>,
 * ) => (
 *   reference: import("./reflect").Reference<I>,
 * ) => import("./reflect").Reference<O>}
 */
const compileProxify = (intrinsics, region, membrane) => {
  const { Proxy } = intrinsics;
  const handler = createProxyHandler(intrinsics, region, membrane);
  return (reference) => new Proxy(reference, handler);
};

/**
 * @template X
 * @param {import("./intrinsic").IntrinsicRecord} intrinsics
 * @param {import("./membrane").Handling<X>} handling
 * @return {import("./membrane").Membrane<X, import("./reflect").RawValue>}
 */
export const createMembrane = (intrinsics, { declare, access }) => {
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
  const internalize = (reference) => {
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
  const externalize = (value) => {
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
    declare(isPrimitive(value) ? value : internalize(value));
  /**
   * @type {(inner: X) => import("./reflect").RawValue}
   */
  const leave = (handle) => {
    const value = access(handle);
    return isPrimitive(value) ? value : externalize(value);
  };
  const toExternalProxy = compileProxify(
    intrinsics,
    { enter, leave },
    { internalize, externalize },
  );
  const toInternalProxy = compileProxify(
    intrinsics,
    { enter: leave, leave: enter },
    { internalize: externalize, externalize: internalize },
  );
  return { internalize, externalize };
};
