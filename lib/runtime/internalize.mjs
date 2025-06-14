import { wrapValue } from "./region/core.mjs";
import { LinvailTypeError } from "../error.mjs";
import { defineOwnHost } from "./region/access.mjs";
import { isDataDescriptor } from "./domain.mjs";
import { createEmptyObject } from "./region/create.mjs";
export { standard_pointcut, toStandardAdvice } from "./advice/standard.mjs";

/**
 * @type {(
 *   region: import("./region.js").Region,
 *   reference: import("./domain.js").GuestReference,
 *   config: {
 *     prototype: "none" | "copy" | "Object.prototype",
 *   },
 * ) => null | import("./domain.js").Reference}
 */
const getPrototype = (region, reference, config) => {
  switch (config.prototype) {
    case "none": {
      return null;
    }
    case "copy": {
      const { "global.Reflect.getPrototypeOf": getPrototypeOf } = region;
      return getPrototypeOf(reference);
    }
    case "Object.prototype": {
      const { "global.Object.prototype": object_prototype } = region;
      return object_prototype;
    }
    default: {
      throw new LinvailTypeError(config.prototype);
    }
  }
};

/**
 * @type {(
 *   region: import("./region.js").Region,
 *   reference: import("./domain.js").GuestReference,
 *   config: {
 *     prototype: "none" | "copy" | "Object.prototype",
 *   },
 * ) => import("./domain.js").HostReferenceWrapper}
 */
export const internalizeGuestReference = (region, reference, config) => {
  const {
    "global.Reflect.getOwnPropertyDescriptor": getOwnPropertyDescriptor,
    "global.Reflect.ownKeys": listKey,
  } = region;
  const wrapper = createEmptyObject(
    region,
    getPrototype(region, reference, config),
  );
  const keys = listKey(reference);
  const { length } = keys;
  for (let index = 0; index < length; index++) {
    const key = keys[index];
    const descriptor = getOwnPropertyDescriptor(reference, key);
    if (descriptor) {
      if (isDataDescriptor(descriptor)) {
        defineOwnHost(region, wrapper.plain, key, {
          __proto__: null,
          ...descriptor,
          value:
            descriptor.value === reference
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
