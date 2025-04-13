import { setupVirtualHandler } from "virtual-proxy";
import { map } from "../../util/array.mjs";
import { hasOwnNarrow } from "../../util/record.mjs";
import { isDataDescriptor } from "../domain.mjs";
import { applyHostReference } from "./closure.mjs";
import { defineOwnPlainInternal, getOwnPlainInternal } from "./property.mjs";
import {
  enterPrototype,
  enterReference,
  enterValue,
  leaveReference,
  leaveValue,
} from "./core.mjs";
import { LinvailTypeError } from "../../error.mjs";

const {
  Object: { hasOwn },
} = globalThis;

/**
 * @type {import("./proxy.d.ts").GuestProxyHandler}
 */
const guest_proxy_handler = {
  apply: ({ target, region }, that, input) =>
    leaveValue(
      region,
      applyHostReference(
        region,
        target,
        enterValue(region, that),
        map(input, (value) => enterValue(region, value)),
      ),
    ),
  construct: ({ target, region }, input, new_target) => {
    const { "global.Reflect.construct": construct } = region;
    return leaveReference(
      region,
      construct(
        target.plain,
        map(input, (value) => enterValue(region, value)),
        new_target,
      ),
    );
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
      internal_descriptor.value = enterValue(region, descriptor.value);
    } else {
      if (
        !hasOwnNarrow(descriptor, "get") &&
        !hasOwnNarrow(descriptor, "set") &&
        !hasOwn(target, key)
      ) {
        internal_descriptor.value = enterValue(region, undefined);
      }
    }
    if (hasOwnNarrow(descriptor, "get")) {
      internal_descriptor.get = descriptor.get;
    }
    if (hasOwnNarrow(descriptor, "set")) {
      internal_descriptor.set = descriptor.set;
    }
    return defineOwnPlainInternal(region, target, key, internal_descriptor);
  },
  getOwnPropertyDescriptor: ({ target, region }, key) => {
    const { "global.undefined": undefined } = region;
    const descriptor = getOwnPlainInternal(region, target, key);
    if (descriptor) {
      if (isDataDescriptor(descriptor)) {
        const { value, writable, enumerable, configurable } = descriptor;
        return {
          __proto__: null,
          value: leaveValue(region, value),
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
        return has(current.base, key);
      }
      if (hasOwn(current.plain, key)) {
        return true;
      }
      current = enterPrototype(region, getPrototypeOf(current.plain));
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
        return get(current.base, key, receiver);
      }
      const descriptor = getOwnPlainInternal(region, current, key);
      if (descriptor) {
        if (isDataDescriptor(descriptor)) {
          return leaveValue(region, descriptor.value);
        } else {
          const { get } = descriptor;
          if (get) {
            const wrapper = enterReference(region, get);
            switch (wrapper.type) {
              case "guest": {
                return apply(wrapper.base, receiver, []);
              }
              case "host": {
                return leaveValue(
                  region,
                  applyHostReference(
                    region,
                    wrapper,
                    enterValue(region, receiver),
                    [],
                  ),
                );
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
      current = enterPrototype(region, getPrototypeOf(current.plain));
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
        return set(current.base, key, value, receiver);
      }
      const descriptor = getOwnPlainInternal(region, current, key);
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
            const wrapper = enterReference(region, set);
            switch (wrapper.type) {
              case "guest": {
                apply(wrapper.base, receiver, [value]);
                return true;
              }
              case "host": {
                leaveValue(
                  region,
                  applyHostReference(
                    region,
                    wrapper,
                    enterValue(region, receiver),
                    [enterValue(region, value)],
                  ),
                );
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
      current = enterPrototype(region, getPrototypeOf(current.plain));
    }
    const wrapper = enterValue(region, receiver);
    switch (wrapper.type) {
      case "primitive": {
        return false;
      }
      case "host": {
        const descriptor = getOwnPlainInternal(region, wrapper, key);
        if (descriptor) {
          if (isDataDescriptor(descriptor)) {
            if (descriptor.writable) {
              return defineOwnPlainInternal(region, wrapper, key, {
                __proto__: null,
                ...descriptor,
                value: enterValue(region, value),
              });
            } else {
              return false;
            }
          } else {
            return false;
          }
        } else {
          return defineOwnPlainInternal(region, wrapper, key, {
            __proto__: null,
            value: enterValue(region, value),
            writable: true,
            enumerable: true,
            configurable: true,
          });
        }
      }
      case "guest": {
        const receiver = leaveValue(region, wrapper);
        const descriptor = getOwnPropertyDescriptor(receiver, key);
        if (descriptor) {
          if (isDataDescriptor(descriptor)) {
            if (descriptor.writable) {
              return defineProperty(receiver, key, {
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
          return defineProperty(receiver, key, {
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
 *   region: import("./region.d.ts").Region,
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
 * @type {(
 *   region: import("./region.d.ts").Region,
 *   kind: import("../domain.d.ts").HostReferenceKind,
 *   plain: import("../domain.d.ts").HostReference,
 * ) => import("../domain.d.ts").ProxyReference}
 */
const createProxyReference = (region, kind, plain) => {
  const { "global.Proxy": Proxy } = region;
  return /** @type {any} */ (
    new Proxy(
      makeIntegrity(region, kind),
      setupVirtualHandler(
        { target: plain, region },
        /** @type {any} */ (guest_proxy_handler),
      ),
    )
  );
};

/**
 * @type {<K extends import("../domain.d.ts").HostReferenceKind>(
 *   region: import("./region.d.ts").Region,
 *   kind: K,
 *   plain: import("../domain.d.ts").HostReference<K>,
 * ) => import("../domain.d.ts").HostReferenceWrapperTyping[K]}
 */
export const enterFreshHostReference = (region, kind, fresh) => {
  const { counter, reference_registery } = region;
  const base = createProxyReference(region, kind, fresh);
  const wrapper =
    /** @type {import("../domain.d.ts").HostReferenceWrapper} */ ({
      type: "host",
      base,
      meta: null,
      index: counter.value++,
      kind,
      plain: fresh,
    });
  reference_registery.$set(base, wrapper);
  return /** @type {any} */ (wrapper);
};
