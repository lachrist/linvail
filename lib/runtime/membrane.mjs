import { hasOwnNarrow, isPrimitive } from "../util.mjs";
import { isDataDescriptor } from "./descriptor.mjs";

const {
  Array,
  undefined,
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
 *   descriptor: import("./descriptor").Descriptor<X>,
 *   convertValue: (value: X) => Y,
 *   convertReference: (
 *     value: import("./reflect").Reference<X>,
 *   ) => import("./reflect").Reference<Y>,
 * ) => import("./descriptor").Descriptor<Y>}
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
 * @param {import("./reflect").Reflect} reflect
 * @param {import("./membrane").Region<I, E>} region
 * @param {import("./membrane").Membrane<I, E>} membrane
 * @returns {import("./membrane").ProxyHandler<I, E>}
 */
const createProxyHandler = (
  {
    apply,
    construct,
    getOwnPropertyDescriptor,
    defineProperty,
    getPrototypeOf,
    setPrototypeOf,
  },
  { enter, leave },
  { internalizeReference, externalizeReference },
) => ({
  apply: (target, that, args1) => {
    const { length } = args1;
    /** @type {I[]} */
    const args2 = new Array(length);
    for (let index = 0; index < length; index += 1) {
      args2[index] = enter(args1[index]);
    }
    return leave(apply(target, enter(that), args2));
  },
  construct: (target, args1, new_target) => {
    const { length } = args1;
    /** @type {I[]} */
    const args2 = new Array(length);
    for (let index = 0; index < length; index += 1) {
      args2[index] = enter(args1[index]);
    }
    return externalizeReference(
      construct(target, args2, internalizeReference(new_target)),
    );
  },
  getPrototypeOf: (target) => {
    const prototype = getPrototypeOf(target);
    return prototype === null ? null : externalizeReference(prototype);
  },
  setPrototypeOf: (target, prototype) =>
    setPrototypeOf(
      target,
      prototype === null ? null : internalizeReference(prototype),
    ),
  getOwnPropertyDescriptor: (target, key) => {
    const descriptor = getOwnPropertyDescriptor(target, key);
    return descriptor == null
      ? undefined
      : convertDescriptor(descriptor, leave, externalizeReference);
  },
  defineProperty: (target, key, descriptor) =>
    defineProperty(
      target,
      key,
      convertDescriptor(descriptor, enter, internalizeReference),
    ),
  get: (target, key, receiver) => {
    /** @type {import("./reflect").Value<I>} */
    let current = target;
    while (current !== null) {
      const descriptor = getOwnPropertyDescriptor(current, key);
      if (descriptor != null) {
        if (hasOwnNarrow(descriptor, "value")) {
          return leave(descriptor.value);
        }
        if (descriptor.get) {
          return leave(apply(descriptor.get, enter(receiver), []));
        }
        return undefined;
      }
      current = getPrototypeOf(current);
    }
    return undefined;
  },
  set: (target, key, value, receiver) => {
    /** @type {import("./reflect").Value<I>} */
    let current = target;
    while (current !== null) {
      const descriptor = getOwnPropertyDescriptor(current, key);
      if (descriptor != null) {
        if (isDataDescriptor(descriptor)) {
          descriptor.value = enter(value);
          return defineProperty(current, key, descriptor);
        }
        if (descriptor.set) {
          apply(descriptor.set, enter(receiver), [enter(value)]);
          return true;
        }
        return false;
      }
      current = getPrototypeOf(current);
    }
    return defineProperty(target, key, {
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
 *   global: typeof globalThis,
 *   region: import("./membrane").Region<I, O>,
 *   membrane: import("./membrane").Membrane<I, O>,
 * ) => (
 *   reference: import("./reflect").Reference<I>,
 * ) => import("./reflect").Reference<O>}
 */
const compileProxify = ({ Proxy, Reflect }, region, membrane) => {
  const handler = createProxyHandler(
    /** @type {import("./reflect").Reflect} */ (
      /** @type {unknown} */ (Reflect)
    ),
    region,
    membrane,
  );
  return (reference) =>
    new /** @type {import("./membrane").Proxy} */ (
      /** @type {unknown} */ (Proxy)
    )(reference, handler);
};

/**
 * @template X
 * @param {typeof globalThis} global
 * @param {import("./cage").Cage<X>} handling
 * @return {import("./membrane").Membrane<X, import("./reflect").RawValue>}
 */
export const createMembrane = (global, { capture, release }) => {
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
  const internalizeReference = (reference) => {
    if (apply(hasWeakMap, internals, [reference])) {
      return apply(getWeakMap, internals, [reference]);
    } else {
      // eslint-disable-next-line no-use-before-define
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
  const externalizeReference = (value) => {
    if (apply(hasWeakMap, internals, [value])) {
      return apply(getWeakMap, internals, [value]);
    } else {
      // eslint-disable-next-line no-use-before-define
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
    capture(isPrimitive(value) ? value : internalizeReference(value));
  /**
   * @type {(inner: X) => import("./reflect").RawValue}
   */
  const leave = (handle) => {
    const value = release(handle);
    return isPrimitive(value) ? value : externalizeReference(value);
  };
  const toExternalProxy = compileProxify(
    global,
    { enter, leave },
    { internalizeReference, externalizeReference },
  );
  const toInternalProxy = compileProxify(
    global,
    { enter: leave, leave: enter },
    {
      internalizeReference: externalizeReference,
      externalizeReference: internalizeReference,
    },
  );
  return { internalizeReference, externalizeReference };
};
