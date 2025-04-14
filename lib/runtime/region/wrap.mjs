import { LinvailTypeError } from "../../error.mjs";
import { wrapFreshHostReference } from "./proxy.mjs";

///////////
// enter //
///////////

/**
 * @type {(
 *   region: import("./region.js").Region,
 *   primitive: import("../domain.js").Primitive,
 * ) => import("../domain.js").PrimitiveWrapper}
 */
export const wrapStandardPrimitive = ({ wrapPrimitive }, primitive) =>
  wrapPrimitive(primitive);

/**
 * @type {(
 *   region: import("./region.js").Region,
 *   reference: import("../domain.js").Reference,
 * ) => import("../domain.js").ReferenceWrapper}
 */
export const wrapReference = (
  {
    wrapGuestReference,
    naming,
    reference_registery,
    "global.Array.isArray": isArray,
  },
  reference,
) => {
  const wrapper = reference_registery.$get(reference);
  if (wrapper == null) {
    const wrapper = wrapGuestReference(
      /** @type {import("../domain.js").GuestReference<any>} */ (reference),
      typeof reference === "function"
        ? "function"
        : isArray(
              /** @type {import("../domain.js").GuestReference<any>} */ (
                reference
              ),
            )
          ? "array"
          : "object",
      naming.$get(reference) ?? null,
    );
    reference_registery.$set(reference, wrapper);
    return wrapper;
  } else {
    return wrapper;
  }
};

/**
 * @type {(
 *   region: import("./region.js").Region,
 *   symbol: symbol,
 * ) => import("../domain.js").PrimitiveWrapper}
 */
export const wrapSymbolPrimitive = (
  {
    "global.Symbol.keyFor": getSharedSymbolKey,
    wrapPrimitive,
    shared_symbol_registery,
    symbol_registery,
  },
  symbol,
) => {
  const key = getSharedSymbolKey(symbol);
  if (key == null) {
    const wrapper = symbol_registery.$get(symbol);
    if (wrapper == null) {
      const wrapper = wrapPrimitive(symbol);
      symbol_registery.$set(symbol, wrapper);
      return wrapper;
    } else {
      return wrapper;
    }
  } else {
    const wrapper = shared_symbol_registery.$get(key);
    if (wrapper == null) {
      const wrapper = wrapPrimitive(symbol);
      shared_symbol_registery.$set(key, wrapper);
      return wrapper;
    } else {
      return wrapper;
    }
  }
};

/**
 * @type {(
 *   region: import("./region.js").Region,
 *   value: import("../domain.js").Value,
 * ) => import("../domain.js").Wrapper}
 */
export const wrapValue = (region, value) => {
  if (value == null) {
    return wrapStandardPrimitive(region, value);
  }
  switch (typeof value) {
    case "object": {
      return wrapReference(region, value);
    }
    case "function": {
      return wrapReference(region, value);
    }
    case "symbol": {
      return wrapSymbolPrimitive(region, value);
    }
    case "string": {
      return wrapStandardPrimitive(region, value);
    }
    case "number": {
      return wrapStandardPrimitive(region, value);
    }
    case "bigint": {
      return wrapStandardPrimitive(region, value);
    }
    case "boolean": {
      return wrapStandardPrimitive(region, value);
    }
    default: {
      throw new LinvailTypeError(value);
    }
  }
};

///////////////
// Prototype //
///////////////

/**
 * @type {(
 *   region: import("./region.js").Region,
 *   prototype: null | import("../domain.js").Reference,
 * ) => null | import("../domain.js").ReferenceWrapper}
 */
export const enterPrototype = (region, prototype) =>
  prototype ? wrapReference(region, prototype) : prototype;

/**
 * @type {(
 *   region: import("./region.js").Region,
 *   prototype: null | import("../domain.js").ReferenceWrapper,
 * ) => null | import("../domain.js").Reference}
 */
export const leavePrototype = (_region, prototype) =>
  prototype ? prototype.inner : prototype;

//////////////
// Creation //
//////////////

/**
 * @type {(
 *   region: import("./region.js").Region,
 *   length: number,
 * ) => import("../domain.js").HostReferenceWrapper<"array">}
 */
export const createEmptyArray = (region, length) => {
  const { "global.Array": Array } = region;
  return wrapFreshHostReference(region, "array", new Array(length));
};

/**
 * @type {(
 *   region: import("./region.js").Region,
 *   wrappers: import("../domain.js").Wrapper[],
 * ) => import("../domain.js").HostReferenceWrapper<"array">}
 */
export const createFullArray = (region, wrappers) => {
  const { "global.Array.of": toArray, "global.Reflect.apply": apply } = region;
  return wrapFreshHostReference(
    region,
    "array",
    apply(toArray, null, wrappers),
  );
};

/**
 * @type {(
 *   region: import("./region.js").Region,
 *   prototype: null | import("../domain.js").Reference,
 * ) => import("../domain.js").HostReferenceWrapper<"object">}
 */
export const createEmptyObject = (region, prototype) => {
  const { "global.Object.create": createObject } = region;
  return wrapFreshHostReference(region, "object", createObject(prototype));
};

/**
 * @type {(
 *   region: import("./region.js").Region,
 *   literal: {
 *     [key in string]: key extends "__proto__"
 *       ? null | import("../domain.js").Reference
 *       : import("../domain.js").Wrapper
 *   },
 * ) => import("../domain.js").HostReferenceWrapper<"object">}
 */
export const createFullObject = (region, literal) =>
  wrapFreshHostReference(region, "object", /** @type {any} */ (literal));
