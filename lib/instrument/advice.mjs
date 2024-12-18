import { map } from "../util.mjs";

const {
  Object: { keys: listKey },
} = globalThis;

/**
 * @type {{
 *   [key in keyof import("../advice").Advice<unknown>]: import(".").Variable
 * }}
 */
const advice = {
  apply: /** @type {import(".").Variable} */ (".apply"),
  construct: /** @type {import(".").Variable} */ (".construct"),
  capture: /** @type {import(".").Variable} */ (".capture"),
  release: /** @type {import(".").Variable} */ (".release"),
  internalize: /** @type {import(".").Variable} */ (".internalize"),
  externalize: /** @type {import(".").Variable} */ (".externalize"),
  sanitizeClosure: /** @type {import(".").Variable} */ (".sanitizeClosure"),
};

const advice_variable_array = /**
 * @type {(keyof import("../advice").Advice<unknown>)[]}
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
 *   name: keyof import("../advice").Advice<unknown>,
 *   tag: T,
 * ) => import(".").Statement<T>}
 */
const setupSingleAdvice = (hidden, name, tag) => ({
  type: "EffectStatement",
  inner: {
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
  },
  tag,
});

/**
 * @type {<T>(
 *   hidden: string,
 *   tag: T,
 * ) => import(".").Statement<T>[]}
 */
export const setupAdvice = (hidden, tag) =>
  map(advice_variable_array, (variable) =>
    setupSingleAdvice(hidden, variable, tag),
  );

/**
 * @type {<T>(
 *   intercept: (
 *     | "capture"
 *     | "release"
 *     | "internalize"
 *     | "externalize"
 *     | "sanitizeClosure"
 *   ),
 * ) => (
 *   target: import(".").Expression<T>,
 *   tag: T,
 * ) => import(".").Expression<T>}
 */
const compileIntercept = (intercept) => (target, tag) => ({
  type: "ApplyExpression",
  callee: {
    type: "ReadExpression",
    variable: advice[intercept],
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

export const internalize = compileIntercept("internalize");

export const externalize = compileIntercept("externalize");

export const capture = compileIntercept("capture");

export const release = compileIntercept("release");

export const sanitizeClosure = compileIntercept("sanitizeClosure");

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
