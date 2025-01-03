/* eslint-disable no-use-before-define */

import { LinvailTypeError } from "../error.mjs";
import { concat2, concat3, flaten, map } from "../util.mjs";
import {
  initializeVariable,
  initializeRoutineParameter,
  initializeParameter,
} from "./helper.mjs";
import {
  advice_binding,
  intercept,
  interceptApply,
  interceptConstruct,
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
            inner: initializeParameter("enterValue", "catch.error", node.tag),
            tag: node.tag,
          },
        ]
      : [],
    map(node.bindings, (binding) => ({
      type: "EffectStatement",
      inner: initializeVariable(binding, node.tag),
      tag: node.tag,
    })),
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
  head: concat3(
    initializeRoutineParameter(kind, node.tag),
    map(node.bindings, (binding) => initializeVariable(binding, node.tag)),
    map(node.head, visitEffect),
  ),
  body: map(node.body, visitStatement),
  tail: intercept("leaveValue", visitExpression(node.tail), node.tag),
});

/**
 * @type {<T>(
 *   tag: T,
 * ) => (
 *   inner: import(".").Effect<T>,
 * ) => import(".").Statement<T>}
 */
const compileMakeEffectStatement = (tag) => (inner) => ({
  type: "EffectStatement",
  inner,
  tag,
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
  body: concat2(
    map(
      concat3(
        setupAdvice(hidden, node.tag),
        initializeRoutineParameter(kind, node.tag),
        map(node.bindings, (binding) => initializeVariable(binding, node.tag)),
      ),
      compileMakeEffectStatement(node.tag),
    ),
    map(node.body, visitStatement),
  ),
  tail:
    kind === "eval.local.deep"
      ? visitExpression(node.tail)
      : intercept("leaveValue", visitExpression(node.tail), node.tag),
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
  body: concat2(
    map(
      concat2(
        initializeRoutineParameter(kind, node.tag),
        map(node.bindings, (binding) => initializeVariable(binding, node.tag)),
      ),
      compileMakeEffectStatement(node.tag),
    ),
    map(node.body, visitStatement),
  ),
  tail:
    kind === "arrow.async" ||
    kind === "method.async" ||
    kind === "function.async"
      ? intercept("leaveValue", visitExpression(node.tail), node.tag)
      : visitExpression(node.tail),
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
        test: intercept("leaveBranch", visitExpression(node.test), node.tag),
        then: visitSegmentBlock(node.then, "other"),
        else: visitSegmentBlock(node.else, "other"),
      };
    }
    case "WhileStatement": {
      return {
        ...node,
        test: intercept("leaveBranch", visitExpression(node.test), node.tag),
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
        test: intercept("leaveBranch", visitExpression(node.test), node.tag),
        positive: map(node.positive, visitEffect),
        negative: map(node.negative, visitEffect),
      };
    }
    case "ExportEffect": {
      return {
        ...node,
        value: intercept("leaveValue", visitExpression(node.value), node.tag),
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
      return intercept(
        "enterClosure",
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
      return intercept("enterValue", node, node.tag);
    }
    case "PrimitiveExpression": {
      return intercept("enterPrimitive", node, node.tag);
    }
    case "ConditionalExpression": {
      return {
        ...node,
        test: intercept("leaveBranch", visitExpression(node.test), node.tag),
        consequent: visitExpression(node.consequent),
        alternate: visitExpression(node.alternate),
      };
    }
    case "ImportExpression": {
      return intercept("enterValue", node, node.tag);
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
        code: intercept("leaveValue", visitExpression(node.code), node.tag),
      };
    }
    case "AwaitExpression": {
      return intercept(
        "enterValue",
        {
          ...node,
          promise: intercept(
            "leaveValue",
            visitExpression(node.promise),
            node.tag,
          ),
        },
        node.tag,
      );
    }
    case "YieldExpression": {
      return intercept(
        "enterValue",
        {
          ...node,
          item: intercept("leaveValue", visitExpression(node.item), node.tag),
        },
        node.tag,
      );
    }
    default: {
      throw new LinvailTypeError(node);
    }
  }
};
