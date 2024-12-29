import { VirtualProxy } from "virtual-proxy";
import { getWeakMap, setWeakMap } from "../collection.mjs";
import { hasOwnNarrow, isPrimitive } from "../util.mjs";
import { isDataDescriptor } from "./descriptor.mjs";

const {
  Array,
  Array: { isArray },
  undefined,
  WeakMap,
} = globalThis;

/**
 * @type {<X, Y>(
 *   value: import("./domain").Value<X>,
 *   convertReference: (
 *     value: import("./domain").Reference<X>,
 *   ) => import("./domain").Reference<Y>,
 * ) => undefined | import("./domain").Reference<Y>}
 */
const toReference = (value, convertReference) =>
  isPrimitive(value) ? undefined : convertReference(value);

/**
 * @type {<X, Y>(
 *   descriptor: import("./reflect").Descriptor<X>,
 *   convertValue: (value: X) => Y,
 *   convertReference: (
 *     value: import("./domain").Reference<X>,
 *   ) => import("./domain").Reference<Y>,
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
 * @template O
 * @param {import("./reflect").Reflect<I>} reflect
 * @param {import("./membrane").Region<I, O>} region
 * @param {import("./membrane").Membrane<I, O>} membrane
 * @returns {import("./membrane").ProxyHandler<I, O>}
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
    /** @type {import("./domain").Value<I>} */
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
    /** @type {import("./domain").Value<I>} */
    let current = target;
    while (current !== null) {
      const descriptor = getOwnPropertyDescriptor(current, key);
      if (descriptor != null) {
        if (isDataDescriptor(descriptor)) {
          descriptor.value = enter(value);
          return defineProperty(current, key, descriptor);
        } else {
          if (descriptor.set) {
            apply(descriptor.set, enter(receiver), [enter(value)]);
            return true;
          } else {
            return false;
          }
        }
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
 *   Reflect: import("./membrane").Reflect<I>,
 *   region: import("./membrane").Region<I, O>,
 *   membrane: import("./membrane").Membrane<I, O>,
 * ) => (
 *   reference: import("./domain").Reference<I>,
 * ) => import("./domain").Reference<O>}
 */
const compileProxify = (Reflect, region, membrane) => {
  const handler = createProxyHandler(Reflect, region, membrane);
  return (reference) =>
    /** @type {any} */ (
      new VirtualProxy(
        typeof reference === "function"
          ? function () {}
          : isArray(reference)
            ? []
            : {},
        reference,
        /** @type {any} */ (handler),
      )
    );
};

/**
 * @template X
 * @param {typeof globalThis.Reflect} Reflect
 * @param {import("./membrane").Region<X, import("./domain").RawValue>} region
 * @return {import("./membrane").Reflect<X>}
 */
export const compileReflect = (Reflect, { enter, leave }) => {
  if (enter === identity && leave === identity) {
    return /** @type {import("./membrane").Reflect<X>} */ (
      /** @type {unknown} */ (Reflect)
    );
  } else {
    const {
      apply,
      construct,
      preventExtensions,
      isExtensible,
      getPrototypeOf,
      setPrototypeOf,
      getOwnPropertyDescriptor,
      defineProperty,
      deleteProperty,
      ownKeys,
      has,
      get,
      set,
    } = Reflect;
    return /** @type {import("./membrane").Reflect<X>} */ ({
      apply,
      construct,
      preventExtensions,
      isExtensible,
      getPrototypeOf,
      setPrototypeOf,
      getOwnPropertyDescriptor: (target, key) => TODO,
      defineProperty: (target, key, descriptor) => TODO,
      deleteProperty,
      ownKeys,
      has,
      get: (target, key, receiver) => {
        const value = get(target, key, receiver);
        return;
      },
      set: (target, key, value, receiver) => TODO,
    });
  }
};

/**
 * @template X
 * @param {typeof globalThis} global
 * @param {import("./cage").Cage<X>} handling
 * @return {import("./membrane").Membrane<X, import("./domain").RawValue>}
 */
export const createMembrane = (global, { capture, release }) => {
  /**
   * @type {WeakMap<
   *   import("./domain").Reference<X>,
   *   import("./domain").RawReference
   * >}
   */
  const externals = new WeakMap();
  /**
   * @type {WeakMap<
   *   import("./domain").RawReference,
   *   import("./domain").Reference<X>
   * >}
   */
  const internals = new WeakMap();
  /**
   * @type {(
   *   reference: import("./domain").RawReference,
   * ) => import("./domain").Reference<X>}
   */
  const internalizeReference = (reference) => {
    const cache = getWeakMap(internals, reference);
    if (cache) {
      return cache;
    } else {
      // eslint-disable-next-line no-use-before-define
      const proxy = toInternalProxy(reference);
      setWeakMap(internals, reference, proxy);
      setWeakMap(externals, proxy, reference);
      // console.log({ type: "internalize", reference, proxy });
      return proxy;
    }
  };
  /**
   * @type {(
   *   reference: import("./domain").Reference<X>,
   * ) => import("./domain").RawReference}
   */
  const externalizeReference = (reference) => {
    const cache = getWeakMap(externals, reference);
    if (cache) {
      return cache;
    } else {
      // eslint-disable-next-line no-use-before-define
      const proxy = toExternalProxy(reference);
      setWeakMap(externals, reference, proxy);
      setWeakMap(internals, proxy, reference);
      // console.log({ type: "externalize", reference, proxy });
      return proxy;
    }
  };
  /**
   * @type {(value: import("./domain").RawValue) => X}
   */
  const enter = (value) =>
    capture(isPrimitive(value) ? value : internalizeReference(value));
  /**
   * @type {(inner: X) => import("./domain").RawValue}
   */
  const leave = (handle) => {
    const value = release(handle);
    return isPrimitive(value) ? value : externalizeReference(value);
  };
  const toExternalProxy = compileProxify(
    compileReflect(global.Reflect, { enter, leave }),
    { enter, leave },
    { internalizeReference, externalizeReference },
  );
  const toInternalProxy = compileProxify(
    compileReflect(global.Reflect, { enter: identity, leave: identity }),
    { enter: leave, leave: enter },
    {
      internalizeReference: externalizeReference,
      externalizeReference: internalizeReference,
    },
  );
  return { internalizeReference, externalizeReference };
};
