import { hasOwnNarrow } from "../../util/record.mjs";
import { isDataDescriptor, isNonLengthPropertyKey } from "../domain.mjs";
import { wrapStandardPrimitive } from "./wrap.mjs";

const {
  Object: { hasOwn },
} = globalThis;

/**
 * @type {(
 *   region: import("./region.d.ts").Region,
 *   target: import("../domain.d.ts").HostReference,
 *   key: PropertyKey,
 * ) => undefined | import("../domain.d.ts").HostDescriptor}
 */
export const getOwnHost = (region, target, key) => {
  const {
    "global.Reflect.getOwnPropertyDescriptor": getOwnPropertyDescriptor,
    "global.Array.isArray": isArray,
  } = region;
  if (isArray(target)) {
    if (isNonLengthPropertyKey(key)) {
      return getOwnPropertyDescriptor(target, key);
    } else {
      const descriptor = getOwnPropertyDescriptor(target, "length");
      return {
        ...descriptor,
        value: wrapStandardPrimitive(region, descriptor.value),
      };
    }
  } else {
    return getOwnPropertyDescriptor(target, key);
  }
};

/**
 * @type {(
 *   region: import("./region.d.ts").Region,
 *   descriptor: import("../domain.d.ts").HostDefineDescriptor
 * ) => import("../domain.d.ts").GuestDefineDescriptor}
 */
const toGuestDefineDescriptor = (_region, host_descriptor) => {
  /** @type {import("../domain.d.ts").GuestDefineDescriptor} */
  const guest_descriptor = { __proto__: null };
  if (hasOwnNarrow(host_descriptor, "get")) {
    guest_descriptor.get = host_descriptor.get;
  }
  if (hasOwnNarrow(host_descriptor, "set")) {
    guest_descriptor.set = host_descriptor.set;
  }
  if (hasOwnNarrow(host_descriptor, "value")) {
    guest_descriptor.value = host_descriptor.value.inner;
  }
  if (hasOwnNarrow(host_descriptor, "writable")) {
    guest_descriptor.writable = host_descriptor.writable;
  }
  if (hasOwnNarrow(host_descriptor, "enumerable")) {
    guest_descriptor.enumerable = host_descriptor.enumerable;
  }
  if (hasOwnNarrow(host_descriptor, "configurable")) {
    guest_descriptor.configurable = host_descriptor.configurable;
  }
  return guest_descriptor;
};

/**
 * @type {(
 *   region: import("./region.d.ts").Region,
 *   old_descriptor: undefined | import("../domain.d.ts").HostDescriptor,
 *   new_descriptor: import("../domain.d.ts").HostDefineDescriptor,
 * ) => import("../domain.d.ts").HostDefineDescriptor}
 */
const sanitizeHostDefineDescriptor = (
  region,
  old_descriptor,
  new_descriptor,
) => {
  const { "global.undefined": undefined, "global.Object.is": is } = region;
  if (
    !hasOwn(new_descriptor, "get") &&
    !hasOwn(new_descriptor, "set") &&
    !hasOwn(new_descriptor, "value") &&
    !old_descriptor
  ) {
    return {
      ...new_descriptor,
      value: wrapStandardPrimitive(region, undefined),
    };
  }
  if (
    old_descriptor &&
    isDataDescriptor(old_descriptor) &&
    hasOwnNarrow(new_descriptor, "value") &&
    is(old_descriptor.value.inner, new_descriptor.value.inner)
  ) {
    return {
      ...new_descriptor,
      value: old_descriptor.value,
    };
  }
  return new_descriptor;
};

/**
 * @type {(
 *   region: import("./region.d.ts").Region,
 *   target: import("../domain.d.ts").HostReference,
 *   key: PropertyKey,
 *   descriptor: import("../domain.d.ts").HostDefineDescriptor,
 * ) => boolean}
 */
export const defineOwnHost = (region, target, key, descriptor) => {
  const {
    "global.Reflect.defineProperty": defineProperty,
    "global.Reflect.getOwnPropertyDescriptor": getOwnPropertyDescriptor,
    "global.Array.isArray": isArray,
  } = region;
  if (isArray(target)) {
    if (isNonLengthPropertyKey(key)) {
      return defineProperty(
        target,
        key,
        sanitizeHostDefineDescriptor(
          region,
          getOwnPropertyDescriptor(target, key),
          descriptor,
        ),
      );
    } else {
      return defineProperty(
        target,
        "length",
        toGuestDefineDescriptor(region, descriptor),
      );
    }
  } else {
    return defineProperty(
      target,
      key,
      sanitizeHostDefineDescriptor(
        region,
        getOwnPropertyDescriptor(target, key),
        descriptor,
      ),
    );
  }
};
