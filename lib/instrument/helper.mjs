import { map } from "../util/array.mjs";
import { intercept } from "./advice.mjs";

/**
 * @type {<T>(
 *   convertion: import("./type").Convertion,
 *   variable: import("./type").Parameter,
 *   tag: T,
 * ) => import("./type").Effect<T>}
 */
export const initializeParameter = (convertion, variable, tag) => ({
  type: "WriteEffect",
  variable,
  value: intercept(convertion, { type: "ReadExpression", variable, tag }, tag),
  tag,
});

/**
 * @type {<T>(
 *   binding: [
 *     import("./type").Variable,
 *     intrinsic: import("./type").Intrinsic,
 *   ],
 *   tag: T,
 * ) => import("./type").Effect<T>}
 */
export const initializeVariable = ([variable, intrinsic], tag) => ({
  type: "WriteEffect",
  variable,
  value: intercept(
    intrinsic === "undefined" || intrinsic === "aran.deadzone_symbol"
      ? "enterPrimitive"
      : "enterValue",
    { type: "ReadExpression", variable, tag },
    tag,
  ),
  tag,
});

/**
 * @type {{
 *   [key in import("./type").RoutineKind]: [
 *     import("./type").Parameter,
 *     import("./type").Convertion,
 *   ][]
 * }}
 */
const ROUTINE_PARAMETER_MAPPING = {
  "function": [
    ["new.target", "enterNewTarget"],
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
  "function.async": [
    ["new.target", "enterPrimitive"],
    ["function.arguments", "enterArgumentList"],
  ],
  "arrow.async": [["function.arguments", "enterArgumentList"]],
  "method.async": [
    ["new.target", "enterPrimitive"],
    ["function.arguments", "enterArgumentList"],
  ],
  "generator.async": [
    ["new.target", "enterPrimitive"],
    ["function.arguments", "enterArgumentList"],
  ],
  "module.global": [
    ["this", "enterPrimitive"],
    ["import", "enterPlainExternalReference"],
    ["import.meta", "enterPlainExternalReference"],
  ],
  "script.global": [
    ["this", "enterPlainExternalReference"],
    ["import", "enterPlainExternalReference"],
  ],
  "eval.global": [
    ["this", "enterPlainExternalReference"],
    ["import", "enterPlainExternalReference"],
  ],
  "eval.local.deep": [],
  "eval.local.root": [
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
 *   kind: import("./type").RoutineKind,
 *   tag: T,
 * ) => import("./type").Effect<T>[]}
 */
export const initializeRoutineParameter = (kind, tag) =>
  map(ROUTINE_PARAMETER_MAPPING[kind], ({ 0: parameter, 1: convertion }) =>
    initializeParameter(convertion, parameter, tag),
  );
