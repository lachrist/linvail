import { createSafeMap } from "../../util/collection.mjs";
import { LinvailTypeError } from "../../error.mjs";
import { enterFreshHostReference } from "./proxy.mjs";

const { Symbol } = globalThis;

///////////
// Event //
///////////

/**
 * @type {<V extends import("../domain.d.ts").Wrapper>(
 *   region: import("./region.d.ts").Region,
 *   event: "capture" | "release",
 *   value: V,
 * ) => V}
 */
const emit = ({ listening }, event, value) => {
  const listeners = listening[event];
  if (listeners && listening.active) {
    listening.active = false;
    try {
      listeners.$forEach((listener) => {
        listener(value);
      });
    } finally {
      listening.active = true;
    }
  }
  return value;
};

/**
 * @type {(
 *   region: import("./region.d.ts").Region,
 *   event: "capture" | "release",
 *   listener: (
 *     internal: import("../domain.d.ts").Wrapper,
 *   ) => void,
 * ) => symbol}
 */
export const addEventListener = ({ listening }, event, listener) => {
  const listeners = listening[event];
  const symbol = Symbol("listener");
  if (listeners === null) {
    listening[event] = createSafeMap([[symbol, listener]]);
  } else {
    listeners.$set(symbol, listener);
  }
  return symbol;
};

/**
 * @type {(
 *   region: import("./region.d.ts").Region,
 *   event: "capture" | "release",
 *   symbol: symbol,
 * ) => boolean}
 */
export const removeEventListener = ({ listening }, event, symbol) => {
  const listeners = listening[event];
  if (listeners === null) {
    return false;
  } else {
    const success = listeners.$delete(symbol);
    if (listeners.$getSize() === 0) {
      listening[event] = null;
    }
    return success;
  }
};

///////////
// leave //
///////////

/**
 * @type {<W extends import("../domain.d.ts").Wrapper>(
 *   region: import("./region.d.ts").Region,
 *   value: W,
 * ) => W["base"]}
 */
export const leaveValue = (region, value) =>
  emit(region, "release", value).base;

/**
 * @type {(
 *   region: import("./region.d.ts").Region,
 *   value: import("../domain.d.ts").PrimitiveWrapper,
 * ) => import("../domain.d.ts").Primitive}
 */
export const leavePrimitive = (region, value) =>
  emit(region, "release", value).base;

/**
 * @type {(
 *   region: import("./region.d.ts").Region,
 *   value: import("../domain.d.ts").ReferenceWrapper,
 * ) => import("../domain.d.ts").Reference}
 */
export const leaveReference = (region, value) =>
  emit(region, "release", value).base;

///////////
// enter //
///////////

/**
 * @type {(
 *   region: import("./region.d.ts").Region,
 *   primitive: import("../domain.d.ts").Primitive,
 * ) => import("../domain.d.ts").PrimitiveWrapper}
 */
const wrapStandardPrimitive = ({ counter }, primitive) => ({
  __proto__: null,
  type: "primitive",
  base: primitive,
  meta: null,
  index: counter.value++,
});

/**
 * @type {(
 *   region: import("./region.d.ts").Region,
 *   reference: import("../domain.d.ts").Reference,
 * ) => import("../domain.d.ts").ReferenceWrapper}
 */
const wrapReference = ({ naming, counter, reference_registery }, reference) => {
  const wrapper = reference_registery.$get(reference);
  if (wrapper == null) {
    const base = /** @type {import("../domain.d.ts").GuestReference<any>} */ (
      reference
    );
    /** @type {import("../domain.d.ts").GuestReferenceWrapper} */
    const wrapper = {
      __proto__: null,
      type: "guest",
      base,
      meta: null,
      index: counter.value++,
      kind: /** @type {any} */ (typeof reference),
      name: naming.$get(base) ?? null,
    };
    reference_registery.$set(reference, wrapper);
    return wrapper;
  } else {
    return wrapper;
  }
};

/**
 * @type {(
 *   region: import("./region.d.ts").Region,
 *   symbol: symbol,
 * ) => import("../domain.d.ts").PrimitiveWrapper}
 */
const wrapSymbolPrimitive = (
  {
    counter,
    "global.Symbol.keyFor": getSharedSymbolKey,
    shared_symbol_registery,
    symbol_registery,
  },
  symbol,
) => {
  const key = getSharedSymbolKey(symbol);
  if (key == null) {
    let wrapper = symbol_registery.$get(symbol);
    if (wrapper == null) {
      wrapper = {
        __proto__: null,
        type: "primitive",
        base: symbol,
        meta: null,
        index: counter.value++,
      };
      symbol_registery.$set(symbol, wrapper);
    }
    return wrapper;
  } else {
    let wrapper = shared_symbol_registery.$get(key);
    if (wrapper == null) {
      wrapper = {
        __proto__: null,
        type: "primitive",
        base: symbol,
        meta: null,
        index: counter.value++,
      };
      shared_symbol_registery.$set(key, wrapper);
    }
    return wrapper;
  }
};

/**
 * @type {(
 *   region: import("./region.d.ts").Region,
 *   value: import("../domain.d.ts").Value,
 * ) => import("../domain.d.ts").Wrapper}
 */
const wrapValue = (region, value) => {
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
 *   region: import("./region.d.ts").Region,
 *   value: import("../domain.d.ts").StandardPrimitive,
 * ) => import("../domain.d.ts").PrimitiveWrapper}
 */
export const enterStandardPrimitive = (region, primitive) =>
  emit(region, "capture", wrapStandardPrimitive(region, primitive));

/**
 * @type {(
 *   region: import("./region.d.ts").Region,
 *   value: symbol,
 * ) => import("../domain.d.ts").PrimitiveWrapper}
 */
export const enterSymbolPrimitive = (region, primitive) =>
  emit(region, "capture", wrapSymbolPrimitive(region, primitive));

/**
 * @type {(
 *   region: import("./region.d.ts").Region,
 *   value: import("../domain.d.ts").Reference,
 * ) => import("../domain.d.ts").ReferenceWrapper}
 */
export const enterReference = (region, reference) =>
  emit(region, "capture", wrapReference(region, reference));

/**
 * @type {(
 *   region: import("./region.d.ts").Region,
 *   value: import("../domain.d.ts").Value,
 * ) => import("../domain.d.ts").Wrapper}
 */
export const enterValue = (region, value) =>
  emit(region, "capture", wrapValue(region, value));

///////////////
// Prototype //
///////////////

/**
 * @type {(
 *   region: import("./region.d.ts").Region,
 *   prototype: null | import("../domain.d.ts").Reference,
 * ) => null | import("../domain.d.ts").ReferenceWrapper}
 */
export const enterPrototype = (region, prototype) =>
  prototype ? enterReference(region, prototype) : prototype;

/**
 * @type {(
 *   region: import("./region.d.ts").Region,
 *   prototype: null | import("../domain.d.ts").ReferenceWrapper,
 * ) => null | import("../domain.d.ts").Reference}
 */
export const leavePrototype = (region, prototype) =>
  prototype ? leaveReference(region, prototype) : prototype;

//////////////
// Creation //
//////////////

/**
 * @type {(
 *   region: import("../region/region.d.ts").Region,
 *   length: number,
 * ) => import("../domain.d.ts").HostReferenceWrapper<"array">}
 */
export const createEmptyArray = (region, length) => {
  const { "global.Array": Array } = region;
  return enterFreshHostReference(region, "array", new Array(length));
};

/**
 * @type {(
 *   region: import("../region/region.d.ts").Region,
 *   wrappers: import("../domain.d.ts").Wrapper[],
 * ) => import("../domain.d.ts").HostReferenceWrapper<"array">}
 */
export const createFullArray = (region, wrappers) => {
  const { "global.Array.of": toArray, "global.Reflect.apply": apply } = region;
  return enterFreshHostReference(
    region,
    "array",
    apply(toArray, null, wrappers),
  );
};

/**
 * @type {(
 *   region: import("../region/region.d.ts").Region,
 *   prototype: null | import("../domain.d.ts").Reference,
 * ) => import("../domain.d.ts").HostReferenceWrapper<"object">}
 */
export const createEmptyObject = (region, prototype) => {
  const { "global.Object.create": createObject } = region;
  return enterFreshHostReference(region, "object", createObject(prototype));
};

/**
 * @type {(
 *   region: import("../region/region.d.ts").Region,
 *   literal: {
 *     [key in string]: key extends "__proto__"
 *       ? null | import("../domain.d.ts").Reference
 *       : import("../domain.d.ts").Wrapper
 *   },
 * ) => import("../domain.d.ts").HostReferenceWrapper<"object">}
 */
export const createFullObject = (region, literal) =>
  enterFreshHostReference(region, "object", /** @type {any} */ (literal));
