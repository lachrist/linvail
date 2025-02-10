import { setupVirtualHandler } from "virtual-proxy";
import { map } from "../../util/array.mjs";
import { hasOwnNarrow } from "../../util/record.mjs";
import { isDataDescriptor } from "../domain.mjs";
import { applyPlainInternalReference } from "./closure.mjs";
import {
  enterPlainInternalReference,
  isGuestExternalReference,
  isGuestInternalReference,
  leavePlainExternalReference,
} from "./core.mjs";
import {
  enterAccessor,
  enterPrototype,
  enterReference,
  enterValue,
  leaveAccessor,
  leavePrototype,
  leaveReference,
  leaveValue,
} from "./util.mjs";
import { isPrimitive } from "../../util/primitive.mjs";
import { defineOwnPlainInternal, getOwnPlainInternal } from "./property.mjs";
import { getWeakMap } from "../../util/collection.mjs";

const {
  Object: { hasOwn },
  Array: { isArray },
} = globalThis;

/**
 * @type {import("./proxy").GuestProxyHandler}
 */
const guest_proxy_handler = {
  apply: ({ target, region }, that, input) =>
    leaveValue(
      region,
      applyPlainInternalReference(
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
        target,
        map(input, (value) => enterValue(region, value)),
        enterReference(region, new_target),
      ),
    );
  },
  getPrototypeOf: ({ target, region }) => {
    const { "global.Reflect.getPrototypeOf": getPrototypeOf } = region;
    return leavePrototype(region, getPrototypeOf(target));
  },
  setPrototypeOf: ({ target, region }, prototype) => {
    const { "global.Reflect.setPrototypeOf": setPrototypeOf } = region;
    return setPrototypeOf(target, enterPrototype(region, prototype));
  },
  isExtensible: ({ target, region }) => {
    const { "global.Reflect.isExtensible": isExtensible } = region;
    return isExtensible(target);
  },
  preventExtensions: ({ target, region }) => {
    const { "global.Reflect.preventExtensions": preventExtensions } = region;
    return preventExtensions(target);
  },
  ownKeys: ({ target, region }) => {
    const { "global.Reflect.ownKeys": ownKeys } = region;
    return ownKeys(target);
  },
  deleteProperty: ({ target, region }, key) => {
    const { "global.Reflect.deleteProperty": deleteProperty } = region;
    return deleteProperty(target, key);
  },
  defineProperty: ({ target, region }, key, descriptor) => {
    const { "global.undefined": undefined } = region;
    /** @type {import("../domain").InternalDefineDescriptor} */
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
      internal_descriptor.get = enterAccessor(region, descriptor.get);
    }
    if (hasOwnNarrow(descriptor, "set")) {
      internal_descriptor.set = enterAccessor(region, descriptor.set);
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
        const { get, set, enumerable, configurable } = descriptor;
        return {
          __proto__: null,
          get: leaveAccessor(region, get),
          set: leaveAccessor(region, set),
          enumerable,
          configurable,
        };
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
    while (true) {
      if (hasOwn(target, key)) {
        return true;
      }
      const prototype = getPrototypeOf(target);
      if (prototype === null) {
        return false;
      }
      if (isGuestInternalReference(region, prototype)) {
        // We have to yield to Reflect.has because the target could be a proxy.
        return has(leavePlainExternalReference(region, prototype), key);
      }
      target = prototype;
    }
  },
  get: ({ target, region }, key, receiver) => {
    const {
      "global.undefined": undefined,
      "global.Reflect.apply": apply,
      "global.Reflect.getPrototypeOf": getPrototypeOf,
      "global.Reflect.get": get,
    } = region;
    while (true) {
      const descriptor = getOwnPlainInternal(region, target, key);
      if (descriptor) {
        if (isDataDescriptor(descriptor)) {
          return leaveValue(region, descriptor.value);
        } else {
          const { get: getter } = descriptor;
          if (getter) {
            if (isGuestInternalReference(region, getter)) {
              return apply(
                leavePlainExternalReference(region, getter),
                receiver,
                [],
              );
            } else {
              return leaveValue(
                region,
                applyPlainInternalReference(
                  region,
                  getter,
                  enterValue(region, receiver),
                  [],
                ),
              );
            }
          } else {
            return undefined;
          }
        }
      }
      const prototype = getPrototypeOf(target);
      if (prototype === null) {
        return undefined;
      }
      if (isGuestInternalReference(region, prototype)) {
        // We have to yield to Reflect.get because the target could be a proxy.
        return get(
          leavePlainExternalReference(region, prototype),
          key,
          receiver,
        );
      }
      target = prototype;
    }
  },
  set: ({ target, region }, key, value, receiver) => {
    const {
      "global.Reflect.set": set,
      "global.Reflect.apply": apply,
      "global.Reflect.getPrototypeOf": getPrototypeOf,
      "global.Reflect.getOwnPropertyDescriptor": getOwnPropertyDescriptor,
      "global.Reflect.defineProperty": defineProperty,
    } = region;
    while (true) {
      const descriptor = getOwnPlainInternal(region, target, key);
      if (descriptor) {
        if (isDataDescriptor(descriptor)) {
          if (descriptor.writable) {
            break;
          } else {
            return false;
          }
        } else {
          const { set: setter } = descriptor;
          if (setter) {
            if (isGuestInternalReference(region, setter)) {
              apply(leavePlainExternalReference(region, setter), receiver, [
                value,
              ]);
            } else {
              applyPlainInternalReference(
                region,
                setter,
                enterValue(region, receiver),
                [enterValue(region, value)],
              );
            }
          }
          return !!setter;
        }
      }
      const prototype = getPrototypeOf(target);
      if (prototype === null) {
        break;
      }
      if (isGuestInternalReference(region, prototype)) {
        // We have to yield to Reflect.set because the target could be a proxy.
        return set(
          leavePlainExternalReference(region, prototype),
          key,
          value,
          receiver,
        );
      }
      target = prototype;
    }
    if (isPrimitive(receiver)) {
      return false;
    } else if (isGuestExternalReference(region, receiver)) {
      const internal = enterPlainInternalReference(region, receiver);
      const descriptor = getOwnPlainInternal(region, internal, key);
      if (descriptor) {
        if (isDataDescriptor(descriptor)) {
          if (descriptor.writable) {
            return defineOwnPlainInternal(region, internal, key, {
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
        return defineOwnPlainInternal(region, internal, key, {
          __proto__: null,
          value: enterValue(region, value),
          writable: true,
          enumerable: true,
          configurable: true,
        });
      }
    } else {
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
  },
};

/**
 * @type {(
 *   region: import("./region").Region,
 *   plain: import("../domain").PlainInternalReference,
 * ) => object}
 */
const makeIntegrity = (region, plain) => {
  const {
    createIntegrityFunction,
    createIntegrityArrow,
    "global.Array.of": createArray,
    "global.Object.create": createObject,
    plain_internal_closure_kind_mapping,
  } = region;
  if (typeof plain === "function") {
    if (getWeakMap(plain_internal_closure_kind_mapping, plain) === "function") {
      return createIntegrityFunction();
    } else {
      return createIntegrityArrow();
    }
  }
  if (isArray(plain)) {
    return createArray();
  }
  return createObject(null);
};

/**
 * @type {(
 *   region: import("./region").Region,
 *   plain: import("../domain").PlainInternalReference,
 * ) => import("../domain").GuestExternalReference}
 */
export const createGuestExternalReference = (region, plain) => {
  const { "global.Proxy": Proxy } = region;
  return /** @type {any} */ (
    new Proxy(
      makeIntegrity(region, plain),
      setupVirtualHandler(
        { target: plain, region },
        /** @type {any} */ (guest_proxy_handler),
      ),
    )
  );
};
