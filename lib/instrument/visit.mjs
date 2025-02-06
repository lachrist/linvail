/* eslint-disable no-use-before-define */

import { LinvailTypeError } from "../error.mjs";
import { concat2, concat3, flaten, map } from "../util/array.mjs";
import {
  initializeVariable,
  initializeRoutineParameter,
  initializeParameter,
} from "./helper.mjs";
import {
  advice_binding_array,
  intercept,
  interceptApply,
  interceptClosure,
  interceptConstruct,
  setupAdvice,
} from "./advice.mjs";

/**
 * @type {{
 *   [k in import("aran").Program["situ"]]: import("aran").ProgramKind
 * }}
 */
const eval_kind_record = {
  "global": "global-eval",
  "local.deep": "deep-local-eval",
  "local.root": "root-local-eval",
};

/**
 * @type {(
 *   node: import("./type").Program<unknown>,
 * ) => import("aran").ProgramKind}
 */
const getProgramKind = ({ kind, situ }) =>
  kind === "eval" ? eval_kind_record[situ] : kind;

/**
 * @type {<T>(
 *   node: import("./type").Program<T>,
 *   hidden: string,
 * ) => import("./type").Program<T>}
 */
export const visitProgram = (node, hidden) => ({
  ...node,
  body: visitProgramBlock(node.body, getProgramKind(node), hidden),
});

/**
 * @type {<T>(
 *   node: import("./type").SegmentBlock<T>,
 *   kind: "catch" | "other",
 * ) => import("./type").SegmentBlock<T>}
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
 *     & import("./type").RoutineBlock<T>
 *     & { head: import("./type").Effect<T>[] }
 *   ),
 *   kind: (
 *     | "generator"
 *     | "async-generator"
 *   ),
 * ) => (
 *   & import("./type").RoutineBlock<T>
 *   & { head: import("./type").Effect<T>[] }
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
 *   inner: import("./type").Effect<T>,
 * ) => import("./type").Statement<T>}
 */
const compileMakeEffectStatement = (tag) => (inner) => ({
  type: "EffectStatement",
  inner,
  tag,
});

/**
 * @type {<T>(
 *   node: import("./type").RoutineBlock<T> & { head: null },
 *   kind: import("aran").ProgramKind,
 *   hidden: string,
 * ) => import("./type").RoutineBlock<T> & { head: null }}
 */
const visitProgramBlock = (node, kind, hidden) => ({
  ...node,
  head: null,
  bindings: concat2(advice_binding_array, node.bindings),
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
    kind === "deep-local-eval"
      ? visitExpression(node.tail)
      : intercept("leaveValue", visitExpression(node.tail), node.tag),
});

/**
 * @type {<T>(
 *   node: import("./type").RoutineBlock<T> & { head: null },
 *   kind: Exclude<
 *     import("aran").ClosureKind,
 *     "generator" | "generator.async"
 *   >,
 * ) => import("./type").RoutineBlock<T> & { head: null }}
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
    kind === "async-arrow" ||
    kind === "async-method" ||
    kind === "async-function"
      ? intercept("leaveValue", visitExpression(node.tail), node.tag)
      : visitExpression(node.tail),
});

/**
 * @type {<T>(
 *   node: import("./type").Statement<T>,
 * ) => import("./type").Statement<T>}
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
        test: intercept("leaveBoolean", visitExpression(node.test), node.tag),
        then: visitSegmentBlock(node.then, "other"),
        else: visitSegmentBlock(node.else, "other"),
      };
    }
    case "WhileStatement": {
      return {
        ...node,
        test: intercept("leaveBoolean", visitExpression(node.test), node.tag),
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
    /* c8 ignore start */
    default: {
      throw new LinvailTypeError(node);
    }
    /* c8 ignore stop */
  }
};

/**
 * @type {<T>(
 *   node: import("./type").Effect<T>,
 * ) => import("./type").Effect<T>}
 */
const visitEffect = (node) => {
  switch (node.type) {
    case "ConditionalEffect": {
      return {
        ...node,
        test: intercept("leaveBoolean", visitExpression(node.test), node.tag),
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
    /* c8 ignore start */
    default: {
      throw new LinvailTypeError(node);
    }
    /* c8 ignore stop */
  }
};

/**
 * @type {<T>(
 *   node: import("./type").Expression<T>,
 * ) => import("./type").Expression<T>}
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
      return interceptClosure(
        node.kind === "generator"
          ? {
              ...node,
              body: visitGeneratorBlock(
                node.body,
                node.asynchronous ? `async-${node.kind}` : node.kind,
              ),
            }
          : {
              ...node,
              body: visitClosureBlock(
                node.body,
                node.asynchronous ? `async-${node.kind}` : node.kind,
              ),
            },
        node.asynchronous ? `async-${node.kind}` : node.kind,
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
        test: intercept("leaveBoolean", visitExpression(node.test), node.tag),
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
    /* c8 ignore start */
    default: {
      throw new LinvailTypeError(node);
    }
    /* c8 ignore stop */
  }
};
