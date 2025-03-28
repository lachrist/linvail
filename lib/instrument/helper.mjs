import { map } from "../util/array.mjs";
import { intercept } from "./advice.mjs";

/**
 * @type {<T>(
 *   convertion: (
 *     | import("./convertion").Convertion
 *     | "enterFunctionThis"
 *     | "enterFunctionNewTarget"
 *   ),
 *   variable: import("./node").Parameter,
 *   tag: T,
 * ) => import("./node").Effect<T>}
 */
export const initializeParameter = (convertion, variable, tag) => ({
  type: "WriteEffect",
  variable,
  value:
    convertion === "enterFunctionThis"
      ? {
          type: "ConditionalExpression",
          test: {
            type: "ReadExpression",
            variable: "new.target",
            tag,
          },
          consequent: intercept(
            "enterPrimitive",
            { type: "ReadExpression", variable, tag },
            tag,
          ),
          alternate: {
            type: "ReadExpression",
            variable: "this",
            tag,
          },
          tag,
        }
      : convertion === "enterFunctionNewTarget"
        ? {
            type: "ConditionalExpression",
            test: {
              type: "ReadExpression",
              variable: "new.target",
              tag,
            },
            consequent: {
              type: "ReadExpression",
              variable: "new.target",
              tag,
            },
            alternate: intercept(
              "enterPrimitive",
              { type: "IntrinsicExpression", intrinsic: "undefined", tag },
              tag,
            ),
            tag,
          }
        : intercept(convertion, { type: "ReadExpression", variable, tag }, tag),
  tag,
});

/**
 * @type {<T>(
 *   binding: [
 *     import("./node").Variable,
 *     intrinsic: import("./node").Intrinsic,
 *   ],
 *   tag: T,
 * ) => import("./node").Effect<T>}
 */
export const initializeVariable = ([variable, intrinsic], tag) => ({
  type: "WriteEffect",
  variable,
  value: intercept(
    /* c8 ignore start */
    intrinsic === "undefined" || intrinsic === "aran.deadzone_symbol"
      ? "enterPrimitive"
      : // This should never happen in transpiled AranLang programs
        "enterValue",
    /* c8 ignore stop */
    { type: "ReadExpression", variable, tag },
    tag,
  ),
  tag,
});

/**
 * @type {{
 *   [key in import("aran").ClosureKind | import("aran").ProgramKind]: [
 *     import("./node").Parameter,
 *     (
 *       | import("./convertion").Convertion
 *       | "enterFunctionThis"
 *       | "enterFunctionNewTarget"
 *     ),
 *   ][]
 * }}
 */
const ROUTINE_PARAMETER_MAPPING = {
  "function": [
    ["this", "enterFunctionThis"],
    ["new.target", "enterFunctionNewTarget"],
    ["function.arguments", "enterArgumentList"],
  ],
  "arrow": [["function.arguments", "enterArgumentList"]],
  "method": [
    ["new.target", "enterPrimitive"],
    ["function.arguments", "enterArgumentList"],
  ],
  "generator": [
    ["new.target", "enterPrimitive"],
    ["function.arguments", "enterArgumentList"],
  ],
  "async-function": [
    ["new.target", "enterPrimitive"],
    ["function.arguments", "enterArgumentList"],
  ],
  "async-arrow": [["function.arguments", "enterArgumentList"]],
  "async-method": [
    ["new.target", "enterPrimitive"],
    ["function.arguments", "enterArgumentList"],
  ],
  "async-generator": [
    ["new.target", "enterPrimitive"],
    ["function.arguments", "enterArgumentList"],
  ],
  "module": [
    ["this", "enterPrimitive"],
    ["import", "enterPlainExternalReference"],
    ["import.meta", "enterPlainExternalReference"],
  ],
  "script": [
    ["this", "enterPlainExternalReference"],
    ["import", "enterPlainExternalReference"],
  ],
  "global-eval": [
    ["this", "enterPlainExternalReference"],
    ["import", "enterPlainExternalReference"],
  ],
  "deep-local-eval": [],
  "root-local-eval": [
    ["this", "enterValue"],
    ["new.target", "enterValue"],
    ["import", "enterPlainExternalReference"],
    ["scope.read", "enterPlainExternalReference"],
    ["scope.writeStrict", "enterPlainExternalReference"],
    ["scope.writeSloppy", "enterPlainExternalReference"],
    ["scope.discard", "enterPlainExternalReference"],
    ["private.has", "enterPlainExternalReference"],
    ["private.get", "enterPlainExternalReference"],
    ["private.set", "enterPlainExternalReference"],
    ["super.call", "enterPlainExternalReference"],
    ["super.get", "enterPlainExternalReference"],
    ["super.set", "enterPlainExternalReference"],
  ],
};

/**
 * @type {<T>(
 *   kind: import("aran").ClosureKind | import("aran").ProgramKind,
 *   tag: T,
 * ) => import("./node").Effect<T>[]}
 */
export const initializeRoutineParameter = (kind, tag) =>
  map(ROUTINE_PARAMETER_MAPPING[kind], ({ 0: parameter, 1: convertion }) =>
    initializeParameter(convertion, parameter, tag),
  );
