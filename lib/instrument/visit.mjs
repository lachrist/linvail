/* eslint-disable no-use-before-define */

import { LinvailTypeError } from "../error.mjs";
import { concat2, flaten, map } from "../util.mjs";
import { initializeVariable, initializeRoutineParameter } from "./helper.mjs";
import {
  advice_binding,
  enter,
  interceptApply,
  interceptConstruct,
  leave,
  sanitizeClosure,
  setupAdvice,
} from "./advice.mjs";

/**
 * @type {<T>(
 *   node: import(".").Program<T>,
 *   hidden: string,
 * ) => import(".").Program<T>}
 */
export const visitProgram = (node, hidden) => {
  if (node.kind === "eval") {
    return {
      ...node,
      body: visitProgramBlock(node.body, `${node.kind}.${node.situ}`, hidden),
    };
  } else {
    return {
      ...node,
      body: visitProgramBlock(node.body, `${node.kind}.${node.situ}`, hidden),
    };
  }
};

/**
 * @type {<T>(
 *   node: import(".").SegmentBlock<T>,
 *   kind:  "catch" | "other",
 * ) => import(".").SegmentBlock<T>}
 */
const visitSegmentBlock = (node, kind) => ({
  ...node,
  body: flaten([
    kind === "catch"
      ? [
          {
            type: "EffectStatement",
            inner: {
              type: "WriteEffect",
              variable: "catch.error",
              value: enter(
                {
                  type: "ReadExpression",
                  variable: "catch.error",
                  tag: node.tag,
                },
                node.tag,
              ),
              tag: node.tag,
            },
            tag: node.tag,
          },
        ]
      : [],
    map(node.bindings, ({ 0: variable }) =>
      initializeVariable(variable, node.tag),
    ),
    map(node.body, visitStatement),
  ]),
});

/**
 * @type {<T>(
 *   node: (
 *     & import(".").RoutineBlock<T>
 *     & { head: import(".").Effect<T>[] }
 *   ),
 *   kind: (
 *     | "generator"
 *     | "generator.async"
 *   ),
 * ) => (
 *   & import(".").RoutineBlock<T>
 *   & { head: import(".").Effect<T>[] }
 * )}
 */
const visitGeneratorBlock = (node, kind) => ({
  ...node,
  head: map(node.head, visitEffect),
  body: flaten([
    initializeRoutineParameter(kind, node.tag),
    map(node.bindings, ({ 0: variable }) =>
      initializeVariable(variable, node.tag),
    ),
    map(node.body, visitStatement),
  ]),
  tail: leave(visitExpression(node.tail), node.tag),
});

/**
 * @type {<T>(
 *   node: import(".").RoutineBlock<T> & { head: null },
 *   kind: import(".").ProgramKind,
 *   hidden: string,
 * ) => import(".").RoutineBlock<T> & { head: null }}
 */
const visitProgramBlock = (node, kind, hidden) => ({
  ...node,
  head: null,
  bindings: concat2(advice_binding, node.bindings),
  body: flaten([
    setupAdvice(hidden, node.tag),
    initializeRoutineParameter(kind, node.tag),
    map(node.bindings, ({ 0: variable }) =>
      initializeVariable(variable, node.tag),
    ),
    map(node.body, visitStatement),
  ]),
  tail:
    kind === "eval.local.deep"
      ? visitExpression(node.tail)
      : leave(visitExpression(node.tail), node.tag),
});

/**
 * @type {<T>(
 *   node: import(".").RoutineBlock<T> & { head: null },
 *   kind: Exclude<
 *     import(".").ClosureKind,
 *     "generator" | "generator.async"
 *   >,
 * ) => import(".").RoutineBlock<T> & { head: null }}
 */
const visitClosureBlock = (node, kind) => ({
  ...node,
  head: null,
  body: flaten([
    initializeRoutineParameter(kind, node.tag),
    map(node.bindings, ({ 0: variable }) =>
      initializeVariable(variable, node.tag),
    ),
    map(node.body, visitStatement),
  ]),
  tail:
    kind === "arrow.async" ||
    kind === "method.async" ||
    kind === "function.async"
      ? visitExpression(node.tail)
      : leave(visitExpression(node.tail), node.tag),
});

/**
 * @type {<T>(
 *   node: import(".").Statement<T>,
 * ) => import(".").Statement<T>}
 */
const visitStatement = (node) => {
  switch (node.type) {
    case "EffectStatement": {
      return {
        ...node,
        inner: visitEffect(node.inner),
      };
    }
    case "BreakStatement": {
      return node;
    }
    case "DebuggerStatement": {
      return node;
    }
    case "BlockStatement": {
      return {
        ...node,
        body: visitSegmentBlock(node.body, "other"),
      };
    }
    case "IfStatement": {
      return {
        ...node,
        test: leave(visitExpression(node.test), node.tag),
        then: visitSegmentBlock(node.then, "other"),
        else: visitSegmentBlock(node.else, "other"),
      };
    }
    case "WhileStatement": {
      return {
        ...node,
        test: leave(visitExpression(node.test), node.tag),
        body: visitSegmentBlock(node.body, "other"),
      };
    }
    case "TryStatement": {
      return {
        ...node,
        try: visitSegmentBlock(node.try, "other"),
        catch: visitSegmentBlock(node.catch, "catch"),
        finally: visitSegmentBlock(node.finally, "other"),
      };
    }
    default: {
      throw new LinvailTypeError(node);
    }
  }
};

/**
 * @type {<T>(
 *   node: import(".").Effect<T>,
 * ) => import(".").Effect<T>}
 */
const visitEffect = (node) => {
  switch (node.type) {
    case "ConditionalEffect": {
      return {
        ...node,
        test: leave(visitExpression(node.test), node.tag),
        positive: map(node.positive, visitEffect),
        negative: map(node.negative, visitEffect),
      };
    }
    case "ExportEffect": {
      return {
        ...node,
        value: leave(visitExpression(node.value), node.tag),
      };
    }
    case "WriteEffect": {
      return {
        ...node,
        value: visitExpression(node.value),
      };
    }
    case "ExpressionEffect": {
      return {
        ...node,
        discard: visitExpression(node.discard),
      };
    }
    default: {
      throw new LinvailTypeError(node);
    }
  }
};

/**
 * @type {<T>(
 *   node: import(".").Expression<T>,
 * ) => import(".").Expression<T>}
 */
const visitExpression = (node) => {
  switch (node.type) {
    case "ApplyExpression": {
      return interceptApply(
        visitExpression(node.callee),
        visitExpression(node.this),
        map(node.arguments, visitExpression),
        node.tag,
      );
    }
    case "ConstructExpression": {
      return interceptConstruct(
        visitExpression(node.callee),
        map(node.arguments, visitExpression),
        node.tag,
      );
    }
    case "ClosureExpression": {
      return sanitizeClosure(
        node.kind === "generator"
          ? {
              ...node,
              body: visitGeneratorBlock(
                node.body,
                node.asynchronous ? `${node.kind}.async` : node.kind,
              ),
            }
          : {
              ...node,
              body: visitClosureBlock(
                node.body,
                node.asynchronous ? `${node.kind}.async` : node.kind,
              ),
            },
        node.tag,
      );
    }
    case "ReadExpression": {
      return node;
    }
    case "IntrinsicExpression": {
      return enter(node, node.tag);
    }
    case "PrimitiveExpression": {
      return enter(node, node.tag);
    }
    case "ConditionalExpression": {
      return {
        ...node,
        test: leave(visitExpression(node.test), node.tag),
        consequent: visitExpression(node.consequent),
        alternate: visitExpression(node.alternate),
      };
    }
    case "ImportExpression": {
      return enter(node, node.tag);
    }
    case "SequenceExpression": {
      return {
        ...node,
        head: map(node.head, visitEffect),
        tail: visitExpression(node.tail),
      };
    }
    case "EvalExpression": {
      return {
        ...node,
        code: leave(visitExpression(node.code), node.tag),
      };
    }
    case "AwaitExpression": {
      return enter(
        {
          ...node,
          promise: leave(visitExpression(node.promise), node.tag),
        },
        node.tag,
      );
    }
    case "YieldExpression": {
      return enter(
        {
          ...node,
          item: leave(visitExpression(node.item), node.tag),
        },
        node.tag,
      );
    }
    default: {
      throw new LinvailTypeError(node);
    }
  }
};
