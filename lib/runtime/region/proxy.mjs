import { VirtualProxy } from "virtual-proxy";
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

const {
  undefined,
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
    const {
      global: {
        Reflect: { construct },
      },
    } = region;
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
    const {
      global: {
        Reflect: { getPrototypeOf },
      },
    } = region;
    return leavePrototype(region, getPrototypeOf(target));
  },
  setPrototypeOf: ({ target, region }, prototype) => {
    const {
      global: {
        Reflect: { setPrototypeOf },
      },
    } = region;
    return setPrototypeOf(target, enterPrototype(region, prototype));
  },
  isExtensible: ({ target, region }) => {
    const {
      global: {
        Reflect: { isExtensible },
      },
    } = region;
    return isExtensible(target);
  },
  preventExtensions: ({ target, region }) => {
    const {
      global: {
        Reflect: { preventExtensions },
      },
    } = region;
    return preventExtensions(target);
  },
  ownKeys: ({ target, region }) => {
    const {
      global: {
        Reflect: { ownKeys },
      },
    } = region;
    return ownKeys(target);
  },
  deleteProperty: ({ target, region }, key) => {
    const {
      global: {
        Reflect: { deleteProperty },
      },
    } = region;
    return deleteProperty(target, key);
  },
  defineProperty: ({ target, region }, key, descriptor) => {
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
      global: {
        Object: { hasOwn },
        Reflect: { getPrototypeOf, has },
      },
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
        return has(leavePlainExternalReference(region, prototype), key);
      }
      target = prototype;
    }
  },
  get: ({ target, region }, key, receiver) => {
    const {
      global: {
        undefined,
        Reflect: { apply, getPrototypeOf, get },
      },
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
      global: {
        Reflect: {
          set,
          apply,
          getPrototypeOf,
          getOwnPropertyDescriptor,
          defineProperty,
        },
      },
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
 *   plain: import("../domain").PlainInternalReference,
 * ) => object}
 */
const makeIntegrity = (plain) => {
  if (typeof plain === "function") {
    return function () {};
  }
  if (isArray(plain)) {
    return [];
  }
  return {};
};

/**
 * @type {(
 *   region: import("./region").Region,
 *   plain: import("../domain").PlainInternalReference,
 * ) => import("../domain").GuestExternalReference}
 */
export const createGuestExternalReference = (region, plain) =>
  /** @type {any} */ (
    new VirtualProxy(
      makeIntegrity(plain),
      { target: plain, region },
      /** @type {any} */ (guest_proxy_handler),
    )
  );
