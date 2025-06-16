import { wrapCloneGuestReference } from "./clone.mjs";
import {
  applyInternal,
  constructInternal,
  defineInternalPropertyDescriptor,
  deleteInternalOwnProperty,
  getInternalOwnPropertyDescriptor,
  getInternalPropertyValue,
  getInternalPrototype,
  hasInternalOwnProperty,
  hasInternalProperty,
  isInternalArray,
  isInternalExtensible,
  listInternalOwnPropertyKey,
  preventInternalExtension,
  setInternalPropertyValue,
  setInternalPrototype,
} from "./reflect.mjs";
import { wrapReference, wrapValue } from "./region/core.mjs";
import { wrapFreshHostReference } from "./region/proxy.mjs";

/**
 * @type {(
 *   region: import("./region.d.ts").Region,
 * ) => import("./membrane.d.ts").Membrane}
 */
export const createMembrane = (region) => ({
  apply: (target, that, input) => applyInternal(region, target, that, input),
  construct: (target, input, new_target) =>
    constructInternal(region, target, input, new_target),
  preventExtensions: (target) => preventInternalExtension(region, target),
  isExtensible: (target) => isInternalExtensible(region, target),
  getPrototypeOf: (target) => getInternalPrototype(region, target),
  setPrototypeOf: (target, prototype) =>
    setInternalPrototype(region, target, prototype),
  deleteProperty: (target, key) =>
    deleteInternalOwnProperty(region, target, key),
  ownKeys: (target) => listInternalOwnPropertyKey(region, target),
  getOwnPropertyDescriptor: (target, key) =>
    getInternalOwnPropertyDescriptor(region, target, key),
  defineProperty: (target, key, descriptor) =>
    defineInternalPropertyDescriptor(region, target, key, descriptor),
  has: (target, key) => hasInternalProperty(region, target, key),
  get: (target, key, receiver) =>
    getInternalPropertyValue(region, target, key, receiver),
  set: (target, key, value, receiver) =>
    setInternalPropertyValue(region, target, key, value, receiver),
  hasOwn: (target, key) => hasInternalOwnProperty(region, target, key),
  isArray: (target) => isInternalArray(region, target),
  wrap: (target) => wrapValue(region, target),
  wrapPrimitive: region.wrapPrimitive,
  wrapReference: (target) => wrapReference(region, target),
  wrapFreshHostReference: (host, { kind }) =>
    /** @type {import("./domain.js").HostReferenceWrapper<any>} */ (
      wrapFreshHostReference(region, kind, host)
    ),
  wrapCloneGuestReference: (guest, { kind }) =>
    wrapCloneGuestReference(region, kind, guest),
});
