import { LinvailTypeError } from "../../error.mjs";

/**
 * @type {(
 *   region: import("../region.d.ts").Region,
 *   primitive: import("../domain.d.ts").Primitive,
 * ) => import("../domain.d.ts").PrimitiveWrapper}
 */
export const wrapStandardPrimitive = ({ wrapPrimitive }, primitive) =>
  wrapPrimitive(primitive);

/**
 * @type {(
 *   region: import("../region.d.ts").Region,
 *   reference: import("../domain.d.ts").GuestReference,
 *   name: null | string,
 * ) => import("../domain.d.ts").GuestReferenceWrapper}
 */
export const wrapFreshGuestReference = (region, reference, name) => {
  const { reference_registry, wrapGuestReference } = region;
  const wrapper = wrapGuestReference(reference, name);
  reference_registry.$set(reference, wrapper);
  return wrapper;
};

/**
 * @type {(
 *   region: import("../region.d.ts").Region,
 *   reference: import("../domain.d.ts").Reference,
 * ) => import("../domain.d.ts").ReferenceWrapper}
 */
export const wrapReference = (region, reference) => {
  const { reference_registry } = region;
  const wrapper = reference_registry.$get(reference);
  if (wrapper == null) {
    return wrapFreshGuestReference(
      region,
      /** @type {import("../domain.d.ts").GuestReference} */ (reference),
      null,
    );
  } else {
    return wrapper;
  }
};

/**
 * @type {(
 *   region: import("../region.d.ts").Region,
 *   symbol: symbol,
 * ) => import("../domain.d.ts").PrimitiveWrapper}
 */
export const wrapSymbolPrimitive = (
  {
    "global.Symbol.keyFor": getSharedSymbolKey,
    wrapPrimitive,
    shared_symbol_registry,
    symbol_registry,
  },
  symbol,
) => {
  const key = getSharedSymbolKey(symbol);
  if (key == null) {
    const wrapper = symbol_registry.$get(symbol);
    if (wrapper == null) {
      const wrapper = wrapPrimitive(symbol);
      symbol_registry.$set(symbol, wrapper);
      return wrapper;
    } else {
      return wrapper;
    }
  } else {
    const wrapper = shared_symbol_registry.$get(key);
    if (wrapper == null) {
      const wrapper = wrapPrimitive(symbol);
      shared_symbol_registry.$set(key, wrapper);
      return wrapper;
    } else {
      return wrapper;
    }
  }
};

/**
 * @type {(
 *   region: import("../region.d.ts").Region,
 *   value: import("../domain.d.ts").Value,
 * ) => import("../domain.d.ts").Wrapper}
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

/**
 * @type {(
 *   region: import("../region.d.ts").Region,
 *   prototype: null | import("../domain.d.ts").Reference,
 * ) => null | import("../domain.d.ts").ReferenceWrapper}
 */
export const wrapPrototype = (region, prototype) =>
  prototype ? wrapReference(region, prototype) : prototype;
