import { VirtualProxy } from "virtual-proxy";
import { map } from "../../util/array.mjs";
import { hasOwnNarrow } from "../../util/record.mjs";
import {
  isInternalArray,
  isNonLengthPropertyKey,
  isDataDescriptor,
} from "../domain.mjs";
import { applyPlainInternalReference } from "./closure.mjs";
import {
  enterPlainInternalReference,
  enterPrimitive,
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

const {
  undefined,
  Array: { isArray },
  Object: { hasOwn },
} = globalThis;

/**
 * @type {(
 *   region: import("./region").Region,
 *   descriptor: undefined | import("../domain").Descriptor<
 *     import("../domain").InternalValue,
 *     import("../domain").InternalReference,
 *   >,
 * ) => undefined | import("../domain").Descriptor<
 *   import("../domain").ExternalValue,
 *   import("../domain").ExternalReference,
 * >}
 */
const toExternalDescriptor = (region, descriptor) => {
  if (descriptor == null) {
    return descriptor;
  } else {
    if (isDataDescriptor(descriptor)) {
      return {
        ...descriptor,
        value: leaveValue(region, descriptor.value),
      };
    } else {
      return {
        ...descriptor,
        get: leaveAccessor(region, descriptor.get),
        set: leaveAccessor(region, descriptor.set),
      };
    }
  }
};

/**
 * @type {(
 *   region: import("./region").Region,
 *   descriptor: import("../domain").DefineDescriptor<
 *     import("../domain").ExternalValue,
 *     import("../domain").ExternalReference,
 *   >,
 *   already_present: boolean,
 * ) => import("../domain").DefineDescriptor<
 *   import("../domain").InternalValue,
 *   import("../domain").InternalReference,
 * >}
 */
const toInternalDescriptor = (region, external_descriptor, already_present) => {
  /**
   * @type {import("../domain").DefineDescriptor<
   *   import("../domain").InternalValue,
   *   import("../domain").InternalReference,
   * >}
   */
  const internal_descriptor = { __proto__: null };
  if (hasOwnNarrow(external_descriptor, "writable")) {
    internal_descriptor.writable = external_descriptor.writable;
  }
  if (hasOwnNarrow(external_descriptor, "enumerable")) {
    internal_descriptor.enumerable = external_descriptor.enumerable;
  }
  if (hasOwnNarrow(external_descriptor, "configurable")) {
    internal_descriptor.configurable = external_descriptor.configurable;
  }
  if (hasOwnNarrow(external_descriptor, "value")) {
    internal_descriptor.value = enterValue(region, external_descriptor.value);
  } else {
    if (
      !already_present &&
      !hasOwn(external_descriptor, "get") &&
      !hasOwn(external_descriptor, "set")
    ) {
      internal_descriptor.value = enterPrimitive(region, undefined);
    }
  }
  if (hasOwnNarrow(external_descriptor, "get")) {
    internal_descriptor.get = enterAccessor(region, external_descriptor.get);
  }
  if (hasOwnNarrow(external_descriptor, "set")) {
    internal_descriptor.set = enterAccessor(region, external_descriptor.set);
  }
  return internal_descriptor;
};

/**
 * @type {(
 *   region: import("./region").Region,
 *   reference: import("../domain").InternalReference,
 *   key: PropertyKey,
 * ) => boolean}
 */
const hasOwnInternal = (region, reference, key) => {
  const {
    global: {
      Object: { hasOwn },
    },
  } = region;
  if (isGuestInternalReference(region, reference)) {
    return hasOwn(leavePlainExternalReference(region, reference), key);
  } else {
    return hasOwn(reference, key);
  }
};

/**
 * @type {(
 *   region: import("./region").Region,
 *   setter: import("../domain").ExternalAccessor,
 *   value: import("../domain").ExternalValue,
 *   receiver: import("../domain").ExternalValue,
 * ) => boolean}
 */
const applyExternalSetter = (region, setter, value, receiver) => {
  const {
    global: {
      Reflect: { apply },
    },
  } = region;
  if (setter) {
    if (isGuestExternalReference(region, setter)) {
      applyPlainInternalReference(
        region,
        enterPlainInternalReference(region, setter),
        enterValue(region, receiver),
        [enterValue(region, value)],
      );
    } else {
      apply(setter, receiver, [value]);
    }
  }
  return !!setter;
};

/**
 * @type {(
 *   region: import("./region").Region,
 *   getter: import("../domain").InternalAccessor,
 *   value: import("../domain").ExternalValue,
 *   receiver: import("../domain").ExternalValue,
 * ) => boolean}
 */
const applyInternalSetter = (region, setter, value, receiver) => {
  const {
    global: {
      Reflect: { apply },
    },
  } = region;
  if (setter) {
    if (isGuestInternalReference(region, setter)) {
      apply(leavePlainExternalReference(region, setter), receiver, [value]);
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
};

/**
 * @type {(
 *   region: import("./region").Region,
 *   descriptor: import("../domain").ExternalDescriptor,
 *   receiver: import("../domain").ExternalValue,
 * ) => import("../domain").ExternalValue}
 */
const getExternalDescriptor = (region, descriptor, receiver) => {
  const {
    global: {
      undefined,
      Reflect: { apply },
    },
  } = region;
  if (isDataDescriptor(descriptor)) {
    return descriptor.value;
  } else {
    const { get } = descriptor;
    if (get) {
      if (isGuestExternalReference(region, get)) {
        return leaveValue(
          region,
          applyPlainInternalReference(
            region,
            enterPlainInternalReference(region, get),
            enterValue(region, receiver),
            [],
          ),
        );
      } else {
        return apply(get, receiver, []);
      }
    } else {
      return undefined;
    }
  }
};

/**
 * @type {(
 *   region: import("./region").Region,
 *   descriptor: import("../domain").InternalDescriptor,
 *   receiver: import("../domain").ExternalValue,
 * ) => import("../domain").ExternalValue}
 */
const getInternalDescriptor = (region, descriptor, receiver) => {
  const {
    global: {
      undefined,
      Reflect: { apply },
    },
  } = region;
  if (isDataDescriptor(descriptor)) {
    return leaveValue(region, descriptor.value);
  } else {
    const { get } = descriptor;
    if (get) {
      if (isGuestInternalReference(region, get)) {
        return apply(leavePlainExternalReference(region, get), receiver, []);
      } else {
        return leaveValue(
          region,
          applyPlainInternalReference(
            region,
            get,
            enterValue(region, receiver),
            [],
          ),
        );
      }
    } else {
      return undefined;
    }
  }
};

/**
 * @type {(
 *   region: import("./region").Region,
 *   reference: import("../domain").InternalReference,
 * ) => import("../domain").InternalPrototype}
 */
const getInternalPrototype = (region, reference) => {
  const {
    global: {
      Reflect: { getPrototypeOf },
    },
  } = region;
  if (isGuestInternalReference(region, reference)) {
    return enterPrototype(
      region,
      getPrototypeOf(leavePlainExternalReference(region, reference)),
    );
  } else {
    return getPrototypeOf(reference);
  }
};

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
    const {
      global: {
        Reflect: { defineProperty },
      },
    } = region;
    if (isInternalArray(target)) {
      if (isNonLengthPropertyKey(key)) {
        return defineProperty(
          target,
          key,
          toInternalDescriptor(region, descriptor, hasOwn(target, key)),
        );
      } else {
        return defineProperty(target, "length", descriptor);
      }
    } else {
      return defineProperty(
        target,
        key,
        toInternalDescriptor(region, descriptor, hasOwn(target, key)),
      );
    }
  },
  getOwnPropertyDescriptor: ({ target, region }, key) => {
    const {
      global: {
        Reflect: { getOwnPropertyDescriptor },
      },
    } = region;
    if (isInternalArray(target)) {
      if (isNonLengthPropertyKey(key)) {
        return toExternalDescriptor(
          region,
          getOwnPropertyDescriptor(target, key),
        );
      } else {
        return getOwnPropertyDescriptor(target, "length");
      }
    } else {
      return toExternalDescriptor(
        region,
        getOwnPropertyDescriptor(target, key),
      );
    }
  },
  has: ({ target, region }, key) => {
    /** @type {import("../domain").InternalPrototype} */
    let current = target;
    while (current) {
      if (hasOwnInternal(region, current, key)) {
        return true;
      }
      current = getInternalPrototype(region, current);
    }
    return false;
  },
  get: ({ target, region }, key, receiver) => {
    const {
      global: {
        undefined,
        Reflect: { getOwnPropertyDescriptor },
      },
    } = region;
    /** @type {import("../domain").InternalPrototype} */
    let current = target;
    while (current) {
      next: {
        if (isGuestInternalReference(region, current)) {
          const external = leavePlainExternalReference(region, current);
          const descriptor = getOwnPropertyDescriptor(external, key);
          if (descriptor) {
            return getExternalDescriptor(region, descriptor, receiver);
          } else {
            break next;
          }
        } else {
          const internal = current;
          if (isInternalArray(internal)) {
            if (isNonLengthPropertyKey(key)) {
              const descriptor = getOwnPropertyDescriptor(internal, key);
              if (descriptor) {
                return getInternalDescriptor(region, descriptor, receiver);
              } else {
                break next;
              }
            } else {
              return getOwnPropertyDescriptor(internal, "length").value;
            }
          } else {
            const descriptor = getOwnPropertyDescriptor(internal, key);
            if (descriptor) {
              return getInternalDescriptor(region, descriptor, receiver);
            } else {
              break next;
            }
          }
        }
      }
      current = getInternalPrototype(region, current);
    }
    return undefined;
  },
  set: ({ target, region }, key, value, receiver) => {
    const {
      global: {
        Reflect: { getOwnPropertyDescriptor, defineProperty },
      },
    } = region;
    /** @type {import("../domain").InternalPrototype} */
    let current = target;
    while (current) {
      if (isGuestInternalReference(region, current)) {
        const external = leavePlainExternalReference(region, current);
        const descriptor = getOwnPropertyDescriptor(external, key);
        if (descriptor) {
          if (isDataDescriptor(descriptor)) {
            if (descriptor.writable) {
              break;
            } else {
              return false;
            }
          } else {
            return applyExternalSetter(region, descriptor.set, value, receiver);
          }
        }
      } else {
        if (isInternalArray(current)) {
          if (isNonLengthPropertyKey(key)) {
            const descriptor = getOwnPropertyDescriptor(current, key);
            if (descriptor) {
              if (isDataDescriptor(descriptor)) {
                if (descriptor.writable) {
                  break;
                } else {
                  return false;
                }
              } else {
                return applyInternalSetter(
                  region,
                  descriptor.set,
                  value,
                  receiver,
                );
              }
            }
          } else {
            break;
          }
        } else {
          const descriptor = getOwnPropertyDescriptor(current, key);
          if (descriptor) {
            if (isDataDescriptor(descriptor)) {
              if (descriptor.writable) {
                break;
              } else {
                return false;
              }
            } else {
              return applyInternalSetter(
                region,
                descriptor.set,
                value,
                receiver,
              );
            }
          }
        }
      }
      current = getInternalPrototype(region, current);
    }
    if (isPrimitive(receiver)) {
      return false;
    } else if (isGuestExternalReference(region, receiver)) {
      const internal = enterPlainInternalReference(region, receiver);
      if (isInternalArray(internal)) {
        if (isNonLengthPropertyKey(key)) {
          const descriptor = getOwnPropertyDescriptor(internal, key);
          if (descriptor) {
            if (isDataDescriptor(descriptor)) {
              if (descriptor.writable) {
                return defineProperty(internal, key, {
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
            return defineProperty(internal, key, {
              __proto__: null,
              value: enterValue(region, value),
              writable: true,
              enumerable: true,
              configurable: true,
            });
          }
        } else {
          return defineProperty(internal, "length", {
            __proto__: null,
            ...getOwnPropertyDescriptor(internal, "length"),
            value,
          });
        }
      } else {
        const descriptor = getOwnPropertyDescriptor(internal, key);
        if (descriptor) {
          if (isDataDescriptor(descriptor)) {
            if (descriptor.writable) {
              return defineProperty(internal, key, {
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
          return defineProperty(internal, key, {
            __proto__: null,
            value: enterValue(region, value),
            writable: true,
            enumerable: true,
            configurable: true,
          });
        }
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
