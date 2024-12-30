import { LinvailTypeError } from "../error.mjs";
import { concat2 } from "../util.mjs";
import { enter } from "./advice.mjs";

/**
 * @type {<T>(
 *   variable: (
 *     | import(".").Variable
 *     | import(".").Parameter
 *   ),
 *   tag: T,
 * ) => import(".").Statement<T>}
 */
export const initialize = (variable, tag) => ({
  type: "EffectStatement",
  inner: {
    type: "WriteEffect",
    variable,
    value: enter({ type: "ReadExpression", variable, tag }, tag),
    tag,
  },
  tag,
});

export { initialize as initializeVariable };

/**
 * @type {<T>(
 *   kind: import(".").RoutineKind,
 *   tag: T,
 * ) => import(".").Statement<T>[]}
 */
export const initializeRoutineParameter = (kind, tag) => {
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
        : [
            {
              type: "EffectStatement",
              inner: {
                type: "ConditionalEffect",
                test: {
                  type: "ReadExpression",
                  variable: "new.target",
                  tag,
                },
                positive: [],
                negative: [
                  {
                    type: "WriteEffect",
                    variable: "new.target",
                    value: enter(
                      {
                        type: "ReadExpression",
                        variable: "new.target",
                        tag,
                      },
                      tag,
                    ),
                    tag,
                  },
                ],
                tag,
              },
              tag,
            },
          ],
      [
        {
          type: "EffectStatement",
          inner: {
            type: "ExpressionEffect",
            discard: {
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
                  variable: "function.arguments",
                  tag,
                },
                {
                  type: "ApplyExpression",
                  callee: enter(
                    {
                      type: "IntrinsicExpression",
                      intrinsic: "Reflect.getPrototypeOf",
                      tag,
                    },
                    tag,
                  ),
                  this: {
                    type: "IntrinsicExpression",
                    intrinsic: "undefined",
                    tag,
                  },
                  arguments: [
                    {
                      type: "ReadExpression",
                      variable: "function.arguments",
                      tag,
                    },
                  ],
                  tag,
                },
              ],
              tag,
            },
            tag,
          },
          tag,
        },
      ],
    );
  } else if (kind === "module.global") {
    return [
      initialize("import", tag),
      initialize("this", tag),
      initialize("import.meta", tag),
    ];
  } else if (kind === "eval.global" || kind === "script.global") {
    return [initialize("import", tag), initialize("this", tag)];
  } else if (kind === "eval.local.deep") {
    return [];
  } else if (kind === "eval.local.root") {
    return [
      initialize("this", tag),
      initialize("new.target", tag),
      initialize("import", tag),
      initialize("scope.read", tag),
      initialize("scope.writeStrict", tag),
      initialize("scope.writeSloppy", tag),
      initialize("scope.discard", tag),
      initialize("private.has", tag),
      initialize("private.get", tag),
      initialize("private.set", tag),
      initialize("super.call", tag),
      initialize("super.get", tag),
      initialize("super.set", tag),
    ];
  } else {
    throw new LinvailTypeError(kind);
  }
};
