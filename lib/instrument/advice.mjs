import { advice_name_record } from "../advice.mjs";
import { concat2, map } from "../util/array.mjs";
import { listKey } from "../util/record.mjs";

const advice_variable_array = listKey(advice_name_record);

/**
 * @type {(
 *   name: "" | keyof import("../advice").Advice,
 * ) => import("./type").Variable}
 */
const toAdviceVariable = (name) =>
  /** @type {import("./type").Variable} */ (`.${name}`);

/**
 * @type {(
 *   name: keyof import("../advice").Advice,
 * ) => [import("./type").Variable, import("aran").Intrinsic]}
 */
const toAdviceBinding = (name) => [toAdviceVariable(name), "undefined"];

/**
 * @type {[import("./type").Variable, import("aran").Intrinsic]}
 */
const main_advice_binding = [toAdviceVariable(""), "undefined"];

export const advice_binding_array = concat2(
  [main_advice_binding],
  map(advice_variable_array, toAdviceBinding),
);

/**
 * @type {<T>(
 *   name: keyof import("../advice").Advice,
 *   tag: T,
 * ) => import("./type").Effect<T>}
 */
const setupSingleAdvice = (name, tag) => ({
  type: "WriteEffect",
  variable: toAdviceVariable(name),
  value: {
    type: "ApplyExpression",
    callee: {
      type: "IntrinsicExpression",
      intrinsic: "aran.getValueProperty",
      tag,
    },
    this: {
      type: "IntrinsicExpression",
      intrinsic: "undefined",
      tag,
    },
    arguments: [
      {
        type: "ReadExpression",
        variable: toAdviceVariable(""),
        tag,
      },
      {
        type: "PrimitiveExpression",
        primitive: name,
        tag,
      },
    ],
    tag,
  },
  tag,
});

/**
 * @type {<T>(
 *   hidden: string,
 *   tag: T,
 * ) => import("./type").Effect<T>[]}
 */
export const setupAdvice = (hidden, tag) =>
  concat2(
    [
      {
        type: "WriteEffect",
        variable: toAdviceVariable(""),
        value: {
          type: "ApplyExpression",
          callee: {
            type: "IntrinsicExpression",
            intrinsic: "aran.readGlobalVariable",
            tag,
          },
          this: {
            type: "IntrinsicExpression",
            intrinsic: "undefined",
            tag,
          },
          arguments: [{ type: "PrimitiveExpression", primitive: hidden, tag }],
          tag,
        },
        tag,
      },
    ],
    map(advice_variable_array, (variable) => setupSingleAdvice(variable, tag)),
  );

/**
 * @type {<T>(
 *   convertion: import("./type").Convertion,
 *   target: import("./type").Expression<T>,
 *   tag: T,
 * ) => import("./type").Expression<T>}
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
 *   target: import("./type").Expression<T>,
 *   kind: import("aran").ClosureKind,
 *   tag: T
 * ) => import("./type").Expression<T>}
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
 *   callee: import("./type").Expression<T>,
 *   that: import("./type").Expression<T>,
 *   args: import("./type").Expression<T>[],
 *   tag: T,
 * ) => import("./type").Expression<T>}
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
 *   callee: import("./type").Expression<T>,
 *   args: import("./type").Expression<T>[],
 *   tag: T,
 * ) => import("./type").Expression<T>}
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
