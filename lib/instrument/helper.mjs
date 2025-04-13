import { map } from "../util/array.mjs";
import { intercept } from "./advice.mjs";

/**
 * @type {<T>(
 *   convertion: (
 *     | import("./convertion.d.ts").Convertion
 *     | "enterFunctionThis"
 *   ),
 *   variable: import("./node.d.ts").Parameter,
 *   tag: T,
 * ) => import("./node.d.ts").Effect<T>}
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
            "enterStandardPrimitive",
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
      ? "enterStandardPrimitive"
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
 *     import("./node.d.ts").Parameter,
 *     (
 *       | import("./convertion.d.ts").Convertion
 *       | "enterFunctionThis"
 *     ),
 *   ][]
 * }}
 */
const ROUTINE_PARAMETER_MAPPING = {
  "function": [
    ["this", "enterFunctionThis"],
    ["new.target", "enterValue"],
    ["function.arguments", "enterFreshHostArray"],
  ],
  "arrow": [["function.arguments", "enterFreshHostArray"]],
  "method": [
    ["new.target", "enterStandardPrimitive"],
    ["function.arguments", "enterFreshHostArray"],
  ],
  "generator": [
    ["new.target", "enterStandardPrimitive"],
    ["function.arguments", "enterFreshHostArray"],
  ],
  "async-function": [
    ["new.target", "enterStandardPrimitive"],
    ["function.arguments", "enterFreshHostArray"],
  ],
  "async-arrow": [["function.arguments", "enterFreshHostArray"]],
  "async-method": [
    ["new.target", "enterStandardPrimitive"],
    ["function.arguments", "enterFreshHostArray"],
  ],
  "async-generator": [
    ["new.target", "enterStandardPrimitive"],
    ["function.arguments", "enterFreshHostArray"],
  ],
  "module": [
    ["this", "enterStandardPrimitive"],
    ["import", "enterReference"],
    ["import.meta", "enterReference"],
  ],
  "script": [
    ["this", "enterReference"],
    ["import", "enterReference"],
  ],
  "global-eval": [
    ["this", "enterReference"],
    ["import", "enterReference"],
  ],
  "deep-local-eval": [],
  "root-local-eval": [
    ["this", "enterValue"],
    ["new.target", "enterValue"],
    ["import", "enterReference"],
    ["scope.read", "enterReference"],
    ["scope.writeStrict", "enterReference"],
    ["scope.writeSloppy", "enterReference"],
    ["scope.discard", "enterReference"],
    ["private.has", "enterReference"],
    ["private.get", "enterReference"],
    ["private.set", "enterReference"],
    ["super.call", "enterReference"],
    ["super.get", "enterReference"],
    ["super.set", "enterReference"],
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
