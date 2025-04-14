import { setupVirtualHandler } from "virtual-proxy";
import { map } from "../../util/array.mjs";
import { hasOwnNarrow } from "../../util/record.mjs";
import { isDataDescriptor } from "../domain.mjs";
import { applyHost, defineOwnHost, getOwnHost } from "./access.mjs";
import { wrapPrototype, wrapReference, wrapValue } from "./core.mjs";
import { LinvailTypeError } from "../../error.mjs";

const {
  Object: { hasOwn },
} = globalThis;

/**
 * @type {import("./proxy.d.ts").GuestProxyHandler}
 */
const guest_proxy_handler = {
  apply: ({ target, region }, that, input) =>
    applyHost(
      region,
      target,
      wrapValue(region, that),
      map(input, (value) => wrapValue(region, value)),
    ).inner,
  construct: ({ target, region }, input, new_target) => {
    const { "global.Reflect.construct": construct } = region;
    return construct(
      target.plain,
      map(input, (value) => wrapValue(region, value)),
      new_target,
    ).inner;
  },
  getPrototypeOf: ({ target, region }) => {
    const { "global.Reflect.getPrototypeOf": getPrototypeOf } = region;
    return getPrototypeOf(target.plain);
  },
  setPrototypeOf: ({ target, region }, prototype) => {
    const { "global.Reflect.setPrototypeOf": setPrototypeOf } = region;
    return setPrototypeOf(target.plain, prototype);
  },
  isExtensible: ({ target, region }) => {
    const { "global.Reflect.isExtensible": isExtensible } = region;
    return isExtensible(target.plain);
  },
  preventExtensions: ({ target, region }) => {
    const { "global.Reflect.preventExtensions": preventExtensions } = region;
    return preventExtensions(target.plain);
  },
  ownKeys: ({ target, region }) => {
    const { "global.Reflect.ownKeys": ownKeys } = region;
    return ownKeys(target.plain);
  },
  deleteProperty: ({ target, region }, key) => {
    const { "global.Reflect.deleteProperty": deleteProperty } = region;
    return deleteProperty(target.plain, key);
  },
  defineProperty: ({ target, region }, key, descriptor) => {
    const { "global.undefined": undefined } = region;
    /** @type {import("../domain.d.ts").HostDefineDescriptor} */
    const internal_descriptor = { __proto__: null };
    if (hasOwnNarrow(descriptor, "writable")) {
      internal_descriptor.writable = descriptor.writable;
    }
    if (hasOwnNarrow(descriptor, "enumerable")) {
      internal_descriptor.enumerable = descriptor.enumerable;
    }
    if (hasOwnNarrow(descriptor, "configurable")) {
      internal_descriptor.configurable = descriptor.configurable;
    }
    if (hasOwnNarrow(descriptor, "value")) {
      internal_descriptor.value = wrapValue(region, descriptor.value);
    } else {
      if (
        !hasOwnNarrow(descriptor, "get") &&
        !hasOwnNarrow(descriptor, "set") &&
        !hasOwn(target, key)
      ) {
        internal_descriptor.value = wrapValue(region, undefined);
      }
    }
    if (hasOwnNarrow(descriptor, "get")) {
      internal_descriptor.get = descriptor.get;
    }
    if (hasOwnNarrow(descriptor, "set")) {
      internal_descriptor.set = descriptor.set;
    }
    return defineOwnHost(region, target.plain, key, internal_descriptor);
  },
  getOwnPropertyDescriptor: ({ target, region }, key) => {
    const { "global.undefined": undefined } = region;
    const descriptor = getOwnHost(region, target.plain, key);
    if (descriptor) {
      if (isDataDescriptor(descriptor)) {
        const { value, writable, enumerable, configurable } = descriptor;
        return {
          __proto__: null,
          value: value.inner,
          writable,
          enumerable,
          configurable,
        };
      } else {
        return descriptor;
      }
    } else {
      return undefined;
    }
  },
  has: ({ target, region }, key) => {
    const {
      "global.Object.hasOwn": hasOwn,
      "global.Reflect.has": has,
      "global.Reflect.getPrototypeOf": getPrototypeOf,
    } = region;
    /** @type {null | import("../domain.d.ts").ReferenceWrapper} */
    let current = target;
    while (current !== null) {
      if (current.type === "guest") {
        return has(current.inner, key);
      }
      if (hasOwn(current.plain, key)) {
        return true;
      }
      current = wrapPrototype(region, getPrototypeOf(current.plain));
    }
    return false;
  },
  get: ({ target, region }, key, receiver) => {
    const {
      "global.undefined": undefined,
      "global.Reflect.apply": apply,
      "global.Reflect.getPrototypeOf": getPrototypeOf,
      "global.Reflect.get": get,
    } = region;
    /** @type {null | import("../domain.d.ts").ReferenceWrapper} */
    let current = target;
    while (current !== null) {
      if (current.type === "guest") {
        // We have to yield to Reflect.get because the target could be a proxy.
        return get(current.inner, key, receiver);
      }
      const descriptor = getOwnHost(region, current.plain, key);
      if (descriptor) {
        if (isDataDescriptor(descriptor)) {
          return descriptor.value.inner;
        } else {
          const { get } = descriptor;
          if (get) {
            const wrapper = wrapReference(region, get);
            switch (wrapper.type) {
              case "guest": {
                return apply(wrapper.inner, receiver, []);
              }
              case "host": {
                return applyHost(
                  region,
                  wrapper,
                  wrapValue(region, receiver),
                  [],
                ).inner;
              }
              default: {
                throw new LinvailTypeError(wrapper);
              }
            }
          } else {
            return undefined;
          }
        }
      }
      current = wrapPrototype(region, getPrototypeOf(current.plain));
    }
    return undefined;
  },
  set: ({ target, region }, key, value, receiver) => {
    const {
      "global.Reflect.set": set,
      "global.Reflect.apply": apply,
      "global.Reflect.getPrototypeOf": getPrototypeOf,
      "global.Reflect.getOwnPropertyDescriptor": getOwnPropertyDescriptor,
      "global.Reflect.defineProperty": defineProperty,
    } = region;
    /** @type {null | import("../domain.d.ts").ReferenceWrapper} */
    let current = target;
    while (current !== null) {
      if (current.type === "guest") {
        // We have to yield to Reflect.set because the target could be a proxy.
        return set(current.inner, key, value, receiver);
      }
      const descriptor = getOwnHost(region, current.plain, key);
      if (descriptor) {
        if (isDataDescriptor(descriptor)) {
          if (descriptor.writable) {
            break;
          } else {
            return false;
          }
        } else {
          const { set } = descriptor;
          if (set) {
            const wrapper = wrapReference(region, set);
            switch (wrapper.type) {
              case "guest": {
                apply(wrapper.inner, receiver, [value]);
                return true;
              }
              case "host": {
                applyHost(region, wrapper, wrapValue(region, receiver), [
                  wrapValue(region, value),
                ]);
                return true;
              }
              default: {
                throw new LinvailTypeError(wrapper);
              }
            }
          } else {
            return false;
          }
        }
      }
      current = wrapPrototype(region, getPrototypeOf(current.plain));
    }
    const wrapper = wrapValue(region, receiver);
    switch (wrapper.type) {
      case "primitive": {
        return false;
      }
      case "host": {
        const descriptor = getOwnHost(region, wrapper.plain, key);
        if (descriptor) {
          if (isDataDescriptor(descriptor)) {
            if (descriptor.writable) {
              return defineOwnHost(region, wrapper.plain, key, {
                __proto__: null,
                ...descriptor,
                value: wrapValue(region, value),
              });
            } else {
              return false;
            }
          } else {
            return false;
          }
        } else {
          return defineOwnHost(region, wrapper.plain, key, {
            __proto__: null,
            value: wrapValue(region, value),
            writable: true,
            enumerable: true,
            configurable: true,
          });
        }
      }
      case "guest": {
        const descriptor = getOwnPropertyDescriptor(wrapper.inner, key);
        if (descriptor) {
          if (isDataDescriptor(descriptor)) {
            if (descriptor.writable) {
              return defineProperty(wrapper.inner, key, {
                __proto__: null,
                ...descriptor,
                value,
              });
            } else {
              return false;
            }
          } else {
            return false;
          }
        } else {
          return defineProperty(wrapper.inner, key, {
            __proto__: null,
            value,
            writable: true,
            enumerable: true,
            configurable: true,
          });
        }
      }
      default: {
        throw new LinvailTypeError(wrapper);
      }
    }
  },
};

/**
 * @type {(
 *   region: import("../region.d.ts").Region,
 *   kind: import("../domain.d.ts").HostReferenceKind,
 * ) => object}
 */
const makeIntegrity = (region, kind) => {
  switch (kind) {
    case "function": {
      const { createIntegrityFunction } = region;
      return createIntegrityFunction();
    }
    case "array": {
      const { "global.Array.of": createArray } = region;
      return createArray();
    }
    case "object": {
      const { "global.Object.create": createObject } = region;
      return createObject(null);
    }
    default: {
      const { createIntegrityArrow } = region;
      return createIntegrityArrow();
    }
  }
};

/**
 * @type {<K extends import("../domain.d.ts").HostReferenceKind>(
 *   region: import("../region.d.ts").Region,
 *   kind: K,
 *   plain: import("../domain.d.ts").HostReference<K>,
 * ) => import("../domain.d.ts").HostReferenceWrapper<K>}
 */
export const wrapFreshHostReference = (region, kind, fresh) => {
  const {
    reference_registery,
    wrapHostReference,
    "global.Proxy": Proxy,
  } = region;
  /** @type {import("../domain.d.ts").HostReferenceWrapper} */
  const wrapper = /** @type {any} */ (wrapHostReference(fresh, kind));
  /** @type {import("../domain.d.ts").ProxyReference} */
  const proxy = new Proxy(
    makeIntegrity(region, wrapper.kind),
    setupVirtualHandler(
      { target: wrapper, region },
      /** @type {any} */ (guest_proxy_handler),
    ),
  );
  wrapper.inner = proxy;
  reference_registery.$set(proxy, wrapper);
  return /** @type {any} */ (wrapper);
};
