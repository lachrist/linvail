import { map } from "../util.mjs";
import { HIDDEN } from "./hidden.mjs";

const {
  Object: { keys: listKey },
} = globalThis;

/**
 * @type {import(".").Advice}
 */
export const advice = {
  "apply": /** @type {import(".").Variable} */ ("__LINVAIL_APPLY__"),
  "construct": /** @type {import(".").Variable} */ ("__LINVAIL_CONSTRUCT__"),
  "capture": /** @type {import(".").Variable} */ ("__LINVAIL_CAPTURE__"),
  "release": /** @type {import(".").Variable} */ ("__LINVAIL_RELEASE__"),
  "internalize": /** @type {import(".").Variable} */ (
    "__LINVAIL_INTERNALIZE__"
  ),
  "externalize": /** @type {import(".").Variable} */ (
    "__LINVAIL_EXTERNALIZE__"
  ),
  "sanitize-closure": /** @type {import(".").Variable} */ (
    "__LINVAIL_SANITIZE_CLOSURE__"
  ),
};

const advice_variable_array = /**
 * @type {(keyof import(".").Advice)[]}
 */ (listKey(advice));

/**
 * @type {<T>(
 *   name: keyof import(".").Advice,
 *   tag: T,
 * ) => import(".").Statement<T>}
 */
const setupSingleAdvice = (name, tag) => ({
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
            { type: "PrimitiveExpression", primitive: HIDDEN, tag },
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
 *   tag: T,
 * ) => import(".").Statement<T>[]}
 */
export const setupAdvice = (tag) =>
  map(advice_variable_array, (variable) => setupSingleAdvice(variable, tag));

/**
 * @type {<T>(
 *   intercept: (
 *     | "capture"
 *     | "release"
 *     | "internalize"
 *     | "externalize"
 *     | "sanitize-closure"
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

export const sanitizeClosure = compileIntercept("sanitize-closure");

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
