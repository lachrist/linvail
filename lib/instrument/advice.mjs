import { map } from "../util.mjs";

const {
  Object: { keys: listKey },
} = globalThis;

/**
 * @type {{
 *   [key in keyof import("../advice").Advice]: import(".").Variable
 * }}
 */
const advice = {
  apply: /** @type {import(".").Variable} */ (".apply"),
  construct: /** @type {import(".").Variable} */ (".construct"),
  enterValue: /** @type {import(".").Variable} */ (".enterValue"),
  leaveValue: /** @type {import(".").Variable} */ (".leaveValue"),
  enterClosure: /** @type {import(".").Variable} */ (".enterClosure"),
  leaveBranch: /** @type {import(".").Variable} */ (".leaveBranch"),
  enterPrimitive: /** @type {import(".").Variable} */ (".enterPrimitive"),
  enterArgumentList: /** @type {import(".").Variable} */ (".enterArgumentList"),
  enterNewTarget: /** @type {import(".").Variable} */ (".enterNewTarget"),
  enterPlainExternalReference: /** @type {import(".").Variable} */ (
    ".enterPlainExternalReference"
  ),
};

const advice_variable_array = /**
 * @type {(keyof import("../advice").Advice)[]}
 */ (listKey(advice));

/**
 * @type {[
 *   import(".").Variable,
 *   "undefined",
 * ][]}
 */
export const advice_binding = map(advice_variable_array, (variable) => [
  advice[variable],
  "undefined",
]);

/**
 * @type {<T>(
 *   hidden: string,
 *   name: keyof import("../advice").Advice,
 *   tag: T,
 * ) => import(".").Effect<T>}
 */
const setupSingleAdvice = (hidden, name, tag) => ({
  type: "WriteEffect",
  variable: advice[name],
  value: {
    type: "ApplyExpression",
    callee: {
      type: "IntrinsicExpression",
      intrinsic: "aran.get",
      tag,
    },
    this: {
      type: "IntrinsicExpression",
      intrinsic: "undefined",
      tag,
    },
    arguments: [
      {
        type: "ApplyExpression",
        callee: {
          type: "IntrinsicExpression",
          intrinsic: "aran.get",
          tag,
        },
        this: {
          type: "IntrinsicExpression",
          intrinsic: "undefined",
          tag,
        },
        arguments: [
          { type: "IntrinsicExpression", intrinsic: "aran.global", tag },
          { type: "PrimitiveExpression", primitive: hidden, tag },
        ],
        tag,
      },
      { type: "PrimitiveExpression", primitive: name, tag },
    ],
    tag,
  },
  tag,
});

/**
 * @type {<T>(
 *   hidden: string,
 *   tag: T,
 * ) => import(".").Effect<T>[]}
 */
export const setupAdvice = (hidden, tag) =>
  map(advice_variable_array, (variable) =>
    setupSingleAdvice(hidden, variable, tag),
  );

/**
 * @type {<T>(
 *   convert: Exclude<
 *     keyof import("../advice").Advice,
 *     "apply" | "construct"
 *   >,
 *   target: import(".").Expression<T>,
 *   tag: T,
 * ) => import(".").Expression<T>}
 */
export const intercept = (convert, target, tag) => ({
  type: "ApplyExpression",
  callee: {
    type: "ReadExpression",
    variable: advice[convert],
    tag,
  },
  this: {
    type: "IntrinsicExpression",
    intrinsic: "undefined",
    tag,
  },
  arguments: [target],
  tag,
});

/**
 * @type {<T>(
 *   callee: import(".").Expression<T>,
 *   that: import(".").Expression<T>,
 *   args: import(".").Expression<T>[],
 *   tag: T,
 * ) => import(".").Expression<T>}
 */
export const interceptApply = (callee, that, args, tag) => ({
  type: "ApplyExpression",
  callee: {
    type: "ReadExpression",
    variable: advice.apply,
    tag,
  },
  this: {
    type: "IntrinsicExpression",
    intrinsic: "undefined",
    tag,
  },
  arguments: [
    callee,
    that,
    {
      type: "ApplyExpression",
      callee: {
        type: "IntrinsicExpression",
        intrinsic: "Array.of",
        tag,
      },
      this: {
        type: "IntrinsicExpression",
        intrinsic: "undefined",
        tag,
      },
      arguments: args,
      tag,
    },
  ],
  tag,
});

/**
 * @type {<T>(
 *   callee: import(".").Expression<T>,
 *   args: import(".").Expression<T>[],
 *   tag: T,
 * ) => import(".").Expression<T>}
 */
export const interceptConstruct = (callee, args, tag) => ({
  type: "ApplyExpression",
  callee: {
    type: "ReadExpression",
    variable: advice.construct,
    tag,
  },
  this: {
    type: "IntrinsicExpression",
    intrinsic: "undefined",
    tag,
  },
  arguments: [
    callee,
    {
      type: "ApplyExpression",
      callee: {
        type: "IntrinsicExpression",
        intrinsic: "Array.of",
        tag,
      },
      this: {
        type: "IntrinsicExpression",
        intrinsic: "undefined",
        tag,
      },
      arguments: args,
      tag,
    },
  ],
  tag,
});
