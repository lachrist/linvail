import { LinvailTypeError } from "../error.mjs";
import { concat2 } from "../util.mjs";
import { capture, externalize, internalize, release } from "./advice.mjs";

/**
 * @type {(
 *   kind: import(".").RoutineKind,
 * ) => kind is import(".").ProgramKind}
 */
export const isProgramKind = (kind) =>
  kind === "script.global" ||
  kind === "module.global" ||
  kind === "eval.global" ||
  kind === "eval.local.root" ||
  kind === "eval.local.deep";

/**
 * @type {<T>(
 *   variable: (
 *     | import(".").Variable
 *     | import(".").Parameter
 *   ),
 *   tag: T,
 * ) => import(".").Expression<T>}
 */
export const internalizePrototype = (variable, tag) => ({
  type: "ApplyExpression",
  callee: {
    type: "IntrinsicExpression",
    intrinsic: "Reflect.setPrototypeOf",
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
      variable,
      tag,
    },
    internalize(
      {
        type: "ApplyExpression",
        callee: {
          type: "IntrinsicExpression",
          intrinsic: "Reflect.getPrototypeOf",
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
            variable,
            tag,
          },
        ],
        tag,
      },
      tag,
    ),
  ],
  tag,
});

/**
 * @type {<T>(
 *   variable: (
 *     | import(".").Variable
 *     | import(".").Parameter
 *   ),
 *   tag: T,
 * ) => import(".").Statement<T>}
 */
export const initializeExternal = (variable, tag) => ({
  type: "EffectStatement",
  inner: {
    type: "WriteEffect",
    variable,
    value: capture(
      internalize({ type: "ReadExpression", variable, tag }, tag),
      tag,
    ),
    tag,
  },
  tag,
});

/**
 * @type {<T>(
 *   variable: (
 *     | import(".").Variable
 *     | import(".").Parameter
 *   ),
 *   tag: T,
 * ) => import(".").Statement<T>}
 */
export const initializeInternal = (variable, tag) => ({
  type: "EffectStatement",
  inner: {
    type: "WriteEffect",
    variable,
    value: capture({ type: "ReadExpression", variable, tag }, tag),
    tag,
  },
  tag,
});

/**
 * @type {<T>(
 *   kind: import(".").RoutineKind,
 *   node: import(".").Expression<T>,
 *   tag: T,
 * ) => import(".").Expression<T>}
 */
export const returnResult = (kind, node, tag) => {
  if (kind === "function") {
    return {
      type: "SequenceExpression",
      head: [
        {
          type: "WriteEffect",
          variable: "this",
          value: node,
          tag,
        },
      ],
      tail: {
        type: "ConditionalExpression",
        test: release(
          { type: "ReadExpression", variable: "new.target", tag },
          tag,
        ),
        consequent: release(
          { type: "ReadExpression", variable: "this", tag },
          tag,
        ),
        alternate: { type: "ReadExpression", variable: "this", tag },
        tag,
      },
      tag,
    };
  } else if (
    kind === "arrow" ||
    kind === "method" ||
    kind === "eval.local.deep"
  ) {
    return node;
  } else if (
    kind === "arrow.async" ||
    kind === "method.async" ||
    kind === "function.async" ||
    kind === "generator.async" ||
    kind === "generator" ||
    kind === "eval.global" ||
    kind === "module.global" ||
    kind === "eval.local.root" ||
    kind === "script.global"
  ) {
    return externalize(release(node, tag), tag);
  } else {
    throw new LinvailTypeError(kind);
  }
};

/**
 * @type {<T>(
 *   kind: import(".").RoutineKind,
 *   tag: T,
 * ) => import(".").Statement<T>[]}
 */
export const initializeParameter = (kind, tag) => {
  if (
    kind === "function" ||
    kind === "arrow" ||
    kind === "method" ||
    kind === "generator" ||
    kind === "function.async" ||
    kind === "arrow.async" ||
    kind === "method.async" ||
    kind === "generator.async"
  ) {
    return concat2(
      kind === "arrow" || kind === "arrow.async"
        ? []
        : [initializeInternal("new.target", tag)],
      [
        initializeInternal("function.callee", tag),
        {
          type: "EffectStatement",
          inner: {
            type: "ExpressionEffect",
            discard: internalizePrototype("function.arguments", tag),
            tag,
          },
          tag,
        },
        initializeInternal("function.arguments", tag),
      ],
    );
  } else if (kind === "module.global") {
    return [
      initializeExternal("import", tag),
      initializeExternal("this", tag),
      initializeExternal("import.meta", tag),
    ];
  } else if (kind === "eval.global" || kind === "script.global") {
    return [initializeExternal("import", tag), initializeExternal("this", tag)];
  } else if (kind === "eval.local.deep") {
    return [];
  } else if (kind === "eval.local.root") {
    return [
      initializeExternal("this", tag),
      initializeExternal("new.target", tag),
      initializeExternal("import", tag),
      initializeExternal("scope.read", tag),
      initializeExternal("scope.writeStrict", tag),
      initializeExternal("scope.writeSloppy", tag),
      initializeExternal("scope.discard", tag),
      initializeExternal("private.has", tag),
      initializeExternal("private.get", tag),
      initializeExternal("private.set", tag),
      initializeExternal("super.call", tag),
      initializeExternal("super.get", tag),
      initializeExternal("super.set", tag),
    ];
  } else {
    throw new LinvailTypeError(kind);
  }
};
