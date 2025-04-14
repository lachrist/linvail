import { map } from "../util/array.mjs";
import { intercept } from "./advice.mjs";

/**
 * @type {<T>(
 *   convertion: (
 *     | import("./convertion.d.ts").Convertion
 *     | "wrapFunctionThis"
 *   ),
 *   variable: import("./node.d.ts").Parameter,
 *   tag: T,
 * ) => import("./node.d.ts").Effect<T>}
 */
export const initializeParameter = (convertion, variable, tag) => ({
  type: "WriteEffect",
  variable,
  value:
    convertion === "wrapFunctionThis"
      ? {
          type: "ConditionalExpression",
          test: {
            type: "ReadExpression",
            variable: "new.target",
            tag,
          },
          consequent: intercept(
            "wrapStandardPrimitive",
            { type: "PrimitiveExpression", primitive: null, tag },
            tag,
          ),
          alternate: {
            type: "ReadExpression",
            variable: "this",
            tag,
          },
          tag,
        }
      : intercept(convertion, { type: "ReadExpression", variable, tag }, tag),
  tag,
});

/**
 * @type {<T>(
 *   binding: [
 *     import("./node.d.ts").Variable,
 *     intrinsic: import("./node.d.ts").Intrinsic,
 *   ],
 *   tag: T,
 * ) => import("./node.d.ts").Effect<T>}
 */
export const initializeVariable = ([variable, intrinsic], tag) => ({
  type: "WriteEffect",
  variable,
  value: intercept(
    /* c8 ignore start */
    intrinsic === "undefined" || intrinsic === "aran.deadzone_symbol"
      ? "wrapStandardPrimitive"
      : // This should never happen in transpiled AranLang programs
        "wrap",
    /* c8 ignore stop */
    { type: "ReadExpression", variable, tag },
    tag,
  ),
  tag,
});

/**
 * @type {{
 *   [key in import("aran").ClosureKind | import("aran").ProgramKind]: [
 *     import("./node.d.ts").Parameter,
 *     (
 *       | import("./convertion.d.ts").Convertion
 *       | "wrapFunctionThis"
 *     ),
 *   ][]
 * }}
 */
const ROUTINE_PARAMETER_MAPPING = {
  "function": [
    ["this", "wrapFunctionThis"],
    ["new.target", "wrap"],
    ["function.arguments", "wrapFreshHostArray"],
  ],
  "arrow": [["function.arguments", "wrapFreshHostArray"]],
  "method": [
    ["new.target", "wrapStandardPrimitive"],
    ["function.arguments", "wrapFreshHostArray"],
  ],
  "generator": [
    ["new.target", "wrapStandardPrimitive"],
    ["function.arguments", "wrapFreshHostArray"],
  ],
  "async-function": [
    ["new.target", "wrapStandardPrimitive"],
    ["function.arguments", "wrapFreshHostArray"],
  ],
  "async-arrow": [["function.arguments", "wrapFreshHostArray"]],
  "async-method": [
    ["new.target", "wrapStandardPrimitive"],
    ["function.arguments", "wrapFreshHostArray"],
  ],
  "async-generator": [
    ["new.target", "wrapStandardPrimitive"],
    ["function.arguments", "wrapFreshHostArray"],
  ],
  "module": [
    ["this", "wrapStandardPrimitive"],
    ["import", "wrapReference"],
    ["import.meta", "wrapReference"],
  ],
  "script": [
    ["this", "wrapReference"],
    ["import", "wrapReference"],
  ],
  "global-eval": [
    ["this", "wrapReference"],
    ["import", "wrapReference"],
  ],
  "deep-local-eval": [],
  "root-local-eval": [
    ["this", "wrap"],
    ["new.target", "wrap"],
    ["import", "wrapReference"],
    ["scope.read", "wrapReference"],
    ["scope.writeStrict", "wrapReference"],
    ["scope.writeSloppy", "wrapReference"],
    ["scope.discard", "wrapReference"],
    ["private.has", "wrapReference"],
    ["private.get", "wrapReference"],
    ["private.set", "wrapReference"],
    ["super.call", "wrapReference"],
    ["super.get", "wrapReference"],
    ["super.set", "wrapReference"],
  ],
};

/**
 * @type {<T>(
 *   kind: import("aran").ClosureKind | import("aran").ProgramKind,
 *   tag: T,
 * ) => import("./node.d.ts").Effect<T>[]}
 */
export const initializeRoutineParameter = (kind, tag) =>
  map(ROUTINE_PARAMETER_MAPPING[kind], ({ 0: parameter, 1: convertion }) =>
    initializeParameter(convertion, parameter, tag),
  );
