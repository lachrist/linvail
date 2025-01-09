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

/**
 * @type {(
 *   region: import(".").Region,
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
 *   region: import(".").Region,
 *   descriptor: import("../domain").DefineDescriptor<
 *     import("../domain").ExternalValue,
 *     import("../domain").ExternalReference,
 *   >,
 * ) => import("../domain").DefineDescriptor<
 *   import("../domain").InternalValue,
 *   import("../domain").InternalReference,
 * >}
 */
const toInternalDescriptor = (region, descriptor) =>
  /** @type {any} */ ({
    ...descriptor,
    ...(hasOwnNarrow(descriptor, "value")
      ? { value: enterValue(region, descriptor.value) }
      : null),
    ...(hasOwnNarrow(descriptor, "get")
      ? { get: enterAccessor(region, descriptor.get) }
      : null),
    ...(hasOwnNarrow(descriptor, "set")
      ? { set: enterAccessor(region, descriptor.set) }
      : null),
  });

/**
 * @type {(
 *   region: import(".").Region,
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
 *   region: import(".").Region,
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
 *   region: import(".").Region,
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
 *   region: import(".").Region,
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
 *   region: import(".").Region,
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
 *   region: import(".").Region,
 *   reference: import("../domain").InternalReference,
 *   key: PropertyKey,
 *   receiver: import("../domain").ExternalValue,
 * ) => null | { value: import("../domain").ExternalValue }}
 */
const getOwnInternal = (region, reference, key, receiver) => {
  const {
    global: {
      Reflect: { getOwnPropertyDescriptor },
    },
  } = region;
  if (isGuestInternalReference(region, reference)) {
    const external = leavePlainExternalReference(region, reference);
    const descriptor = getOwnPropertyDescriptor(external, key);
    if (descriptor) {
      return {
        value: getExternalDescriptor(region, descriptor, receiver),
      };
    } else {
      return null;
    }
  } else {
    const internal = reference;
    if (isInternalArray(internal)) {
      if (isNonLengthPropertyKey(key)) {
        const descriptor = getOwnPropertyDescriptor(internal, key);
        if (descriptor) {
          return {
            value: getInternalDescriptor(region, descriptor, receiver),
          };
        } else {
          return null;
        }
      } else {
        return getOwnPropertyDescriptor(internal, "length");
      }
    } else {
      const descriptor = getOwnPropertyDescriptor(internal, key);
      if (descriptor) {
        return {
          value: getInternalDescriptor(region, descriptor, receiver),
        };
      } else {
        return null;
      }
    }
  }
};

/**
 * @type {(
 *   region: import(".").Region,
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
 * @type {(
 *   region: import(".").Region,
 * ) => import("./proxy").GuestExternalReferenceHandler}
 */
export const compileGuestExternalReferenceHandler = (region) => {
  const {
    global: {
      undefined,
      Reflect: {
        construct,
        getPrototypeOf,
        setPrototypeOf,
        defineProperty,
        getOwnPropertyDescriptor,
      },
    },
  } = region;
  return {
    apply: (target, that, input) =>
      leaveValue(
        region,
        applyPlainInternalReference(
          region,
          target,
          enterValue(region, that),
          map(input, (value) => enterValue(region, value)),
        ),
      ),
    construct: (target, input, new_target) =>
      leaveReference(
        region,
        construct(
          target,
          map(input, (value) => enterValue(region, value)),
          enterReference(region, new_target),
        ),
      ),
    getPrototypeOf: (target) => leavePrototype(region, getPrototypeOf(target)),
    setPrototypeOf: (target, prototype) =>
      setPrototypeOf(target, enterPrototype(region, prototype)),
    defineProperty: (target, key, descriptor) => {
      if (isInternalArray(target)) {
        if (isNonLengthPropertyKey(key)) {
          return defineProperty(
            target,
            key,
            toInternalDescriptor(region, descriptor),
          );
        } else {
          return defineProperty(target, "length", descriptor);
        }
      } else {
        return defineProperty(
          target,
          key,
          toInternalDescriptor(region, descriptor),
        );
      }
    },
    getOwnPropertyDescriptor: (target, key) => {
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
    has: (target, key) => {
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
    get: (target, key, receiver) => {
      /** @type {import("../domain").InternalPrototype} */
      let current = target;
      while (current) {
        const data = getOwnInternal(region, current, key, receiver);
        if (data) {
          return data.value;
        }
        current = getInternalPrototype(region, current);
      }
      return undefined;
    },
    set: (target, key, value, receiver) => {
      /** @type {import("../domain").InternalPrototype} */
      let current = target;
      while (current) {
        if (isGuestInternalReference(region, current)) {
          const external = leavePlainExternalReference(region, current);
          const descriptor = getOwnPropertyDescriptor(external, key);
          if (descriptor) {
            if (isDataDescriptor(descriptor)) {
              break;
            } else {
              return applyExternalSetter(
                region,
                descriptor.set,
                value,
                receiver,
              );
            }
          }
        } else {
          if (isInternalArray(current)) {
            if (isNonLengthPropertyKey(key)) {
              const descriptor = getOwnPropertyDescriptor(current, key);
              if (descriptor) {
                if (isDataDescriptor(descriptor)) {
                  break;
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
                break;
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
      if (isInternalArray(target)) {
        if (isNonLengthPropertyKey(key)) {
          return defineProperty(target, key, {
            ...getOwnPropertyDescriptor(target, key),
            value: enterValue(region, value),
          });
        } else {
          return defineProperty(target, "length", {
            ...getOwnPropertyDescriptor(target, "length"),
            value,
          });
        }
      } else {
        return defineProperty(target, key, {
          ...getOwnPropertyDescriptor(target, key),
          value: enterValue(region, value),
        });
      }
    },
  };
};
