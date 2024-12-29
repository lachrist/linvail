import { map } from "../util.mjs";
import { isIntrinsicInternalReference } from "./domain.mjs";
import { enter as enterRegion, leave as leaveRegion } from "./region.mjs";

/**
 * @template X
 * @param {import("./reflect").Reflect} Reflect
 * @param {import("./region").Region<X>} region
 * @returns {import("./proxy").ProxyHandler<X>}
 */
export const compileProxyHandler = (
  {
    apply,
    construct,
    preventExtensions,
    isExtensible,
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
  region,
) => {
  const {
    isIntrinsicInternalReference,
    exfiltrateInternalReference,
    exfiltrateExternalReference,
  } = region;
  /**
   * @type {(
   *   value: import("./domain").ExternalValue,
   * ) => import("./domain").InternalValue<X>}
   */
  const enter = (value) => enterRegion(value, region);
  /**
   * @type {(
   *   value: import("./domain").InternalValue<X>,
   * ) => import("./domain").ExternalValue}
   */
  const leave = (value) => leaveRegion(value, region);
  return {
    apply: (target, that, args) =>
      leave(apply(target, enter(that), map(args, enter))),
    construct: (target, args, new_target) =>
      exfiltrateInternalReference(
        construct(
          target,
          map(args, enter),
          isProxy(new_target) ? unproxify(new_target) : new_target,
        ),
      ),
    getPrototypeOf: (target) => {
      const prototype = getPrototypeOf(target);
      if (prototype === null) {
        return null;
      } else if (isIntrinsicInternalReference(prototype)) {
        return exfiltrateInternalReference(prototype);
      } else {
        return exfiltrateExternalReference(prototype);
      }
    },
    setPrototypeOf: TODO,
    defineProperty: TODO,
    getOwnPropertyDescriptor: TODO,
    get: TODO,
    set: TODO,
  };
};
