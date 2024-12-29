import { isReference } from "../util.mjs";

const {
  Array: { isArray },
  Reflect: { ownKeys },
} = globalThis;

/**
 * @type {(
 *   key: import("./domain").RawValue,
 * ) => import("../primitive").Primitive}
 */
const convertKey = (key) =>
  isReference(key) ? ownKeys({ [/** @type {any} */ (key)]: null })[0] : key;

/**
 * @template X
 * @param {X} handle
 * @param {import("./domain").Value<X>} target
 * @param {import("./domain").RawValue} key
 * @param {(handle: X) => import("./domain").RawValue} fromHandle
 * @return {import("./reflect").ContextHandle<X>}
 */
const contextualizeHandle = (handle, target, key, fromHandle) =>
  isArray(target) && key === "length"
    ? /** @type {import("./reflect").ContextHandle<X>} */ (
        /** @type {unknown} */ (fromHandle(handle))
      )
    : /** @type {import("./reflect").ContextHandle<X>} */ (handle);

/**
 * @template X
 * @param {import("./reflect").ContextHandle<X>} handle
 * @param {import("./domain").Value<X>} target
 * @param {import("./domain").RawValue} key
 * @param {(value: import("./domain").RawValue) => X} toHandle
 * @return {X}
 */
const uncontextualizeHandle = (handle, target, key, toHandle) =>
  isArray(target) && key === "length"
    ? toHandle(
        /** @type {import("./domain").RawValue} */ (
          /** @type {unknown} */ (handle)
        ),
      )
    : /** @type {X} */ (handle);

/**
 * @template X
 * @param {import("./reflect").DefineDescriptor<X>} descriptor
 * @param {import("./domain").Value<X>} target
 * @param {import("./domain").RawValue} key
 * @param {(handle: X) => import("./domain").RawValue} fromHandle
 * @return {import("./reflect").ContextDefineDescriptor<X>}
 */
const contextualizeDefineDescriptor = (descriptor, target, key, fromHandle) =>
  "value" in descriptor && isArray(target) && key === "length"
    ? {
        ...descriptor,
        value: /** @type {import("./reflect").ContextHandle<X>} */ (
          /** @type {unknown} */ (fromHandle(descriptor.value))
        ),
      }
    : /** @type {import("./reflect").ContextDefineDescriptor<X>} */ (
        descriptor
      );

/**
 * @template X
 * @param {import("./reflect").ContextDescriptor<X>} descriptor
 * @param {import("./domain").Value<X>} target
 * @param {import("./domain").RawValue} key
 * @param {(value: import("./domain").RawValue) => X} toHandle
 * @return {import("./reflect").Descriptor<X>}
 */
const uncontextualizeDescriptor = (descriptor, target, key, toHandle) =>
  "value" in descriptor && isArray(target) && key === "length"
    ? {
        ...descriptor,
        value: toHandle(
          /** @type {import("./domain").RawValue} */ (
            /** @type {unknown} */ (descriptor.value)
          ),
        ),
      }
    : /** @type {import("./reflect").Descriptor<X>} */ (descriptor);

/**
 * @type {<X>(
 *   Reflect: import("./reflect").CoarseReflect,
 *   options: {
 *     fromHandle: (handle: X) => import("./domain").RawValue,
 *     toHandle: (value: import("./domain").RawValue) => X,
 *   },
 * ) => import("./reflect").Reflect<X>}
 */
export const compileReflect = (
  {
    apply,
    construct,
    isExtensible,
    preventExtensions,
    getPrototypeOf,
    setPrototypeOf,
    getOwnPropertyDescriptor,
    defineProperty,
    deleteProperty,
    ownKeys,
    has,
    get,
    set,
  },
  { fromHandle, toHandle },
) => ({
  apply,
  construct,
  isExtensible,
  preventExtensions,
  getPrototypeOf,
  setPrototypeOf,
  getOwnPropertyDescriptor: (target, key) => {
    key = convertKey(key);
    const descriptor = getOwnPropertyDescriptor(target, key);
    return (
      descriptor && uncontextualizeDescriptor(descriptor, target, key, toHandle)
    );
  },
  defineProperty: (target, key, descriptor) => {
    key = convertKey(key);
    return defineProperty(
      target,
      key,
      contextualizeDefineDescriptor(descriptor, target, key, fromHandle),
    );
  },
  deleteProperty,
  ownKeys,
  has,
  get: (target, key, receiver) => {
    key = convertKey(key);
    return uncontextualizeHandle(
      get(target, key, receiver),
      target,
      key,
      toHandle,
    );
  },
  set: (target, key, value, receiver) => {
    key = convertKey(key);
    return set(
      target,
      key,
      contextualizeHandle(value, target, key, fromHandle),
      receiver,
    );
  },
});
