import { wrapValue } from "./region/core.mjs";
import { LinvailExecError, LinvailTypeError } from "../error.mjs";
import { defineOwnHost } from "./region/access.mjs";
import { isDataDescriptor } from "./domain.mjs";
import { createEmptyArray, createEmptyObject } from "./region/create.mjs";

/**
 * @type {<K extends "object" | "array">(
 *   region: import("./region.js").Region,
 *   kind: K,
 *   prototype: null | import("./domain.js").Reference,
 * ) => import("./domain.js").HostReferenceWrapper<any>}
 */
const createClone = (region, kind, prototype) => {
  switch (kind) {
    case "object": {
      return createEmptyObject(region, prototype);
    }
    case "array": {
      const {
        "global.Reflect.getPrototypeOf": getPrototypeOf,
        "global.Reflect.setPrototypeOf": setPrototypeOf,
      } = region;
      const wrapper = createEmptyArray(region, 0);
      if (getPrototypeOf(wrapper.plain) !== prototype) {
        if (!setPrototypeOf(wrapper.plain, prototype)) {
          throw new LinvailExecError(
            `Failed to set prototype for ${kind} clone`,
            { wrapper, kind, prototype },
          );
        }
      }
      return wrapper;
    }
    default: {
      throw new LinvailTypeError(kind);
    }
  }
};

/**
 * @type {<K extends "object" | "array">(
 *   region: import("./region.js").Region,
 *   kind: K,
 *   guest: import("./domain.js").GuestReference,
 * ) => import("./domain.js").HostReferenceWrapper<K>}
 */
export const wrapCloneGuestReference = (region, kind, guest) => {
  const {
    "global.Reflect.getPrototypeOf": getPrototypeOf,
    "global.Reflect.getOwnPropertyDescriptor": getOwnPropertyDescriptor,
    "global.Reflect.ownKeys": listKey,
  } = region;
  const wrapper = createClone(region, kind, getPrototypeOf(guest));
  const keys = listKey(guest);
  const { length } = keys;
  for (let index = 0; index < length; index++) {
    const key = keys[index];
    const descriptor = getOwnPropertyDescriptor(guest, key);
    if (descriptor) {
      if (isDataDescriptor(descriptor)) {
        defineOwnHost(region, wrapper.plain, key, {
          __proto__: null,
          ...descriptor,
          value:
            descriptor.value === guest
              ? wrapper
              : wrapValue(region, descriptor.value),
        });
      } else {
        defineOwnHost(region, wrapper.plain, key, {
          __proto__: null,
          ...descriptor,
        });
      }
    }
  }
  return wrapper;
};
