import { hasOwnNarrow } from "./util.mjs";

const {
  undefined,
  Proxy,
  Reflect: {
    apply,
    construct,
    getOwnPropertyDescriptor,
    defineProperty,
    getPrototypeOf,
    setPrototypeOf,
  },
} = globalThis;

/**
 * @type {<X>(
 *   descriptor: import("./reflect").Descriptor<X>,
 * ) => descriptor is import("./reflect").DataDescriptor<X>}
 */
export const isDataDescriptor = (descriptor) =>
  hasOwnNarrow(descriptor, "value");

/**
 * @type {<X>(
 *   descriptor: import("./reflect").Descriptor<X>,
 * ) => descriptor is import("./reflect").AccessorDescriptor<X>}
 */
export const isAccessorDescriptor = (descriptor) =>
  !hasOwnNarrow(descriptor, "value");

const ProxyReference = /**
 * @type {new <I, E>(
 *   reference: import("./reflect").Reference<E>,
 *   handler: import("./reflect").ProxyHandler<I, E>,
 * ) => import("./reflect").Reference<I>}
 */ (/** @type {unknown} */ (Proxy));

export const applyReference = /**
 * @type {<X>(
 *   target: import("./reflect").Reference<X>,
 *   that: X,
 *   args: X[],
 * ) => X}
 */ (/** @type {unknown} */ (apply));

export const constructReference = /**
 * @type {<X>(
 *   target: import("./reflect").Reference<X>,
 *   args: X[],
 *   new_target: import("./reflect").Reference<X>,
 * ) => X}
 */ (/** @type {unknown} */ (construct));

export const getReferenceDescriptor = /**
 * @type {<X>(
 *   target: import("./reflect").Reference<X>,
 *   key: PropertyKey,
 * ) => import("./reflect").Descriptor<X>}
 */ (/** @type {unknown} */ (getOwnPropertyDescriptor));

export const setReferenceDescriptor = /**
 * @type {<X>(
 *   target: import("./reflect").Reference<X>,
 *   key: PropertyKey,
 *   descriptor: import("./reflect").Descriptor<X>,
 * ) => boolean}
 */ (/** @type {unknown} */ (defineProperty));

export const getReferencePrototype = /**
 * @type {<X>(
 *   target: import("./reflect").Reference<X>,
 * ) => null | import("./reflect").Reference<X>}
 */ (/** @type {unknown} */ (getPrototypeOf));

export const setReferencePrototype = /**
 * @type {<X>(
 *   target: import("./reflect").Reference<X>,
 *   prototype: null | import("./reflect").Reference<X>,
 * ) => boolean}
 */ (/** @type {unknown} */ (setPrototypeOf));

/**
 * @template X
 * @template Y
 * @param {import("./reflect").Descriptor<X>} descriptor1
 * @param {(value: X) => Y} convertValue
 * @param {(
 *   value: import("./reflect").Reference<X>,
 * ) => import("./reflect").Reference<Y>} convertReference
 * @return {import("./reflect").Descriptor<Y>}
 */
export const convertDescriptor = (
  descriptor1,
  convertValue,
  convertReference,
) => {
  if (hasOwnNarrow(descriptor1, "value")) {
    const descriptor2 = /** @type {import("./reflect").DataDescriptor<Y>} */ (
      /** @type {unknown} */ (descriptor1)
    );
    descriptor2.value = convertValue(descriptor1.value);
    return descriptor2;
  } else {
    const descriptor2 =
      /** @type {import("./reflect").AccessorDescriptor<Y>} */ (
        /** @type {unknown} */ (descriptor1)
      );
    if (descriptor1.get) {
      descriptor2.get = convertReference(descriptor1.get);
    }
    if (descriptor1.set) {
      descriptor2.set = convertReference(descriptor1.set);
    }
    return descriptor2;
  }
};

/**
 * @template I
 * @template E
 * @param {import("./reflect").Membrane<I, E>} membrane
 * @returns {import("./reflect").ProxyHandler<I, E>}
 */
const createProxyHandler = ({
  enterValue,
  leaveValue,
  enterReference,
  leaveReference,
}) => ({
  apply: (target, that, args1) => {
    const { length } = args1;
    /** @type {I[]} */
    const args2 = new Array(length);
    for (let index = 0; index < length; index += 1) {
      args2[index] = enterValue(args1[index]);
    }
    return leaveValue(applyReference(target, enterValue(that), args2));
  },
  construct: (target, args1, new_target) => {
    const { length } = args1;
    /** @type {I[]} */
    const args2 = new Array(length);
    for (let index = 0; index < length; index += 1) {
      args2[index] = enterValue(args1[index]);
    }
    return leaveValue(
      constructReference(target, args2, enterReference(new_target)),
    );
  },
  getPrototypeOf: (target) => {
    const prototype = getReferencePrototype(target);
    return prototype === null ? null : leaveReference(prototype);
  },
  setPrototypeOf: (target, prototype) =>
    setReferencePrototype(
      target,
      prototype === null ? null : enterReference(prototype),
    ),
  getOwnPropertyDescriptor: (target, key) =>
    convertDescriptor(
      getReferenceDescriptor(target, key),
      leaveValue,
      leaveReference,
    ),
  defineProperty: (target, key, descriptor) =>
    setReferenceDescriptor(
      target,
      key,
      convertDescriptor(descriptor, enterValue, enterReference),
    ),
  get: (target, key, receiver) => {
    /** @type {null | import("./reflect").Reference<I>} */
    let current = target;
    while (current !== null) {
      const descriptor = getReferenceDescriptor(current, key);
      if (descriptor !== undefined) {
        if (hasOwnNarrow(descriptor, "value")) {
          return leaveValue(descriptor.value);
        }
        if (descriptor.get) {
          return leaveValue(
            applyReference(descriptor.get, enterValue(receiver), []),
          );
        }
        return undefined;
      }
      current = getReferencePrototype(current);
    }
    return undefined;
  },
  set: (target, key, value, receiver) => {
    /** @type {null | import("./reflect").Reference<I>} */
    let current = target;
    while (current !== null) {
      const descriptor = getReferenceDescriptor(current, key);
      if (descriptor !== undefined) {
        if (hasOwnNarrow(descriptor, "value")) {
          descriptor.value = enterValue(value);
          return setReferenceDescriptor(current, key, descriptor);
        }
        if (descriptor.set) {
          applyReference(descriptor.set, enterValue(receiver), [
            enterValue(value),
          ]);
          return true;
        }
        return false;
      }
      current = getReferencePrototype(current);
    }
    return setReferenceDescriptor(target, key, {
      __proto__: null,
      value: enterValue(value),
      writable: true,
      enumerable: true,
      configurable: true,
    });
  },
});

/**
 * @type {<I, E>(
 *   membrane: import("./reflect").Membrane<I, E>,
 * ) => (
 *   reference: import("./reflect").Reference<E>,
 * ) => import("./reflect").Reference<I>}
 */
export const compileProxify = (membrane) => {
  const handler = createProxyHandler(membrane);
  return (reference) => new ProxyReference(reference, handler);
};
