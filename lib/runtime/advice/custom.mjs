import { applyInternal, constructInternal } from "../reflect.mjs";
import { wrapFreshHostClosure, wrapHostClosure } from "../region/closure.mjs";
import {
  wrapReference,
  wrapSymbolPrimitive,
  wrapValue,
} from "../region/core.mjs";
import { wrapFreshHostReference } from "../region/proxy.mjs";

/**
 * @type {{
 *   [key in keyof import("./custom.js").CustomAdvice]: null
 * }}
 */
export const advice_name_record = {
  apply: null,
  construct: null,
  wrap: null,
  wrapFreshHostArray: null,
  wrapFreshHostClosure: null,
  wrapStandardPrimitive: null,
  wrapReference: null,
  wrapSymbolPrimitive: null,
  weaveEvalProgram: null,
  wrapHostClosure: null,
};

/**
 * @type {(
 *   region: import("../region.js").Region,
 *   config: import("./config.js").AdviceConfig,
 * ) => import("./custom.js").CustomAdvice}
 */
export const createCustomAdvice = (region, { weaveEvalProgram }) => ({
  weaveEvalProgram,
  wrapSymbolPrimitive: (symbol) => wrapSymbolPrimitive(region, symbol),
  wrapReference: (reference) => wrapReference(region, reference),
  // Bypass abstraction for performance:
  // wrapStandardPrimitive: (primitive) =>
  //   wrapStandardPrimitive(region, primitive),
  wrapStandardPrimitive: region.wrapPrimitive,
  wrap: (value) => wrapValue(region, value),
  wrapFreshHostArray: (reference) =>
    wrapFreshHostReference(region, "array", reference),
  wrapHostClosure: (closure) => wrapHostClosure(region, closure),
  wrapFreshHostClosure: (closure, kind) =>
    wrapFreshHostClosure(region, closure, kind),
  apply: (target, that, input) => applyInternal(region, target, that, input),
  construct: (target, input) =>
    constructInternal(region, target, input, target),
});
