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
 *   reference: import("../domain.d.ts").Reference,
 * ) => import("../domain.d.ts").ReferenceWrapper}
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
      /** @type {import("../domain.d.ts").GuestReference<any>} */ (reference),
      typeof reference === "function"
        ? "function"
        : isArray(
              /** @type {import("../domain.d.ts").GuestReference<any>} */ (
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
 *   region: import("../region.d.ts").Region,
 *   symbol: symbol,
 * ) => import("../domain.d.ts").PrimitiveWrapper}
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
