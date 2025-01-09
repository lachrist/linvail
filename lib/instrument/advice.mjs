import { map } from "../util/array.mjs";
import { listKey } from "../util/record.mjs";

/**
 * @type {{
 *   [key in keyof import("../advice").Advice]: null
 * }}
 */
const advice_record = {
  apply: null,
  construct: null,
  enterValue: null,
  leaveValue: null,
  enterClosure: null,
  leaveBoolean: null,
  enterPrimitive: null,
  enterArgumentList: null,
  enterNewTarget: null,
  enterPlainExternalReference: null,
};

const advice_variable_array = listKey(advice_record);

/**
 * @type {(
 *   name: keyof import("../advice").Advice,
 * ) => import(".").Variable}
 */
const toAdviceVariable = (name) =>
  /** @type {import(".").Variable} */ (`.${name}`);

/**
 * @type {(
 *   name: keyof import("../advice").Advice,
 * ) => [import(".").Variable, import("aran").AranIntrinsicName]}
 */
const toAdviceBinding = (name) => [toAdviceVariable(name), "undefined"];

export const advice_binding_array = map(advice_variable_array, toAdviceBinding);

/**
 * @type {<T>(
 *   hidden: string,
 *   name: keyof import("../advice").Advice,
 *   tag: T,
 * ) => import(".").Effect<T>}
 */
const setupSingleAdvice = (hidden, name, tag) => ({
  type: "WriteEffect",
  variable: toAdviceVariable(name),
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
 *   convertion: import(".").Convertion,
 *   target: import(".").Expression<T>,
 *   tag: T,
 * ) => import(".").Expression<T>}
 */
export const intercept = (convertion, target, tag) => ({
  type: "ApplyExpression",
  callee: {
    type: "ReadExpression",
    variable: toAdviceVariable(convertion),
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
 *   target: import(".").Expression<T>,
 *   kind: import(".").ClosureKind,
 *   tag: T
 * ) => import(".").Expression<T>}
 */
export const interceptClosure = (target, kind, tag) => ({
  type: "ApplyExpression",
  callee: {
    type: "ReadExpression",
    variable: toAdviceVariable("enterClosure"),
    tag,
  },
  this: {
    type: "IntrinsicExpression",
    intrinsic: "undefined",
    tag,
  },
  arguments: [target, { type: "PrimitiveExpression", primitive: kind, tag }],
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
    variable: toAdviceVariable("apply"),
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
    variable: toAdviceVariable("construct"),
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
