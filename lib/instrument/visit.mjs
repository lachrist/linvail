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
 * @type {<T>(
 *   target: import("./node.d.ts").Expression<T>,
 *   tag: T,
 * ) => import("./node.d.ts").Expression<T>}
 */
const unwrap = (target, tag) => ({
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
  arguments: [target, { type: "PrimitiveExpression", primitive: "inner", tag }],
  tag,
});

/**
 * @type {(
 *   node: import("./node.d.ts").Program<unknown>,
 * ) => import("aran").ProgramKind}
 */
const getProgramKind = ({ kind, situ }) =>
  kind === "eval" ? eval_kind_record[situ] : kind;

/**
 * @type {<T>(
 *   node: import("./node.d.ts").Program<T>,
 *   hidden: string,
 * ) => import("./node.d.ts").Program<T>}
 */
export const visitProgram = (node, hidden) => ({
  ...node,
  body: visitProgramBlock(node.body, getProgramKind(node), hidden),
});

/**
 * @type {<T>(
 *   node: import("./node.d.ts").SegmentBlock<T>,
 *   kind: "catch" | "other",
 * ) => import("./node.d.ts").SegmentBlock<T>}
 */
const visitSegmentBlock = (node, kind) => ({
  ...node,
  body: flaten([
    kind === "catch"
      ? [
          {
            type: "EffectStatement",
            inner: initializeParameter("wrap", "catch.error", node.tag),
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
 *     & import("./node.d.ts").RoutineBlock<T>
 *     & { head: import("./node.d.ts").Effect<T>[] }
 *   ),
 *   kind: (
 *     | "generator"
 *     | "async-generator"
 *   ),
 * ) => (
 *   & import("./node.d.ts").RoutineBlock<T>
 *   & { head: import("./node.d.ts").Effect<T>[] }
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
  tail: unwrap(visitExpression(node.tail), node.tag),
});

/**
 * @type {<T>(
 *   tag: T,
 * ) => (
 *   inner: import("./node.d.ts").Effect<T>,
 * ) => import("./node.d.ts").Statement<T>}
 */
const compileMakeEffectStatement = (tag) => (inner) => ({
  type: "EffectStatement",
  inner,
  tag,
});

/**
 * @type {<T>(
 *   node: import("./node.d.ts").RoutineBlock<T> & { head: null },
 *   kind: import("aran").ProgramKind,
 *   hidden: string,
 * ) => import("./node.d.ts").RoutineBlock<T> & { head: null }}
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
      : unwrap(visitExpression(node.tail), node.tag),
});

/**
 * @type {<T>(
 *   node: import("./node.d.ts").RoutineBlock<T> & { head: null },
 *   kind: Exclude<
 *     import("aran").ClosureKind,
 *     "generator" | "generator.async"
 *   >,
 * ) => import("./node.d.ts").RoutineBlock<T> & { head: null }}
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
      ? unwrap(visitExpression(node.tail), node.tag)
      : visitExpression(node.tail),
});

/**
 * @type {<T>(
 *   node: import("./node.d.ts").Statement<T>,
 * ) => import("./node.d.ts").Statement<T>}
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
        test: unwrap(visitExpression(node.test), node.tag),
        then: visitSegmentBlock(node.then, "other"),
        else: visitSegmentBlock(node.else, "other"),
      };
    }
    case "WhileStatement": {
      return {
        ...node,
        test: unwrap(visitExpression(node.test), node.tag),
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
 *   node: import("./node.d.ts").Effect<T>,
 * ) => import("./node.d.ts").Effect<T>}
 */
const visitEffect = (node) => {
  switch (node.type) {
    case "ConditionalEffect": {
      return {
        ...node,
        test: unwrap(visitExpression(node.test), node.tag),
        positive: map(node.positive, visitEffect),
        negative: map(node.negative, visitEffect),
      };
    }
    case "ExportEffect": {
      return {
        ...node,
        value: unwrap(visitExpression(node.value), node.tag),
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
 *   node: import("./node.d.ts").Expression<T>,
 * ) => import("./node.d.ts").Expression<T>}
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
      return intercept(
        node.intrinsic === "undefined"
          ? "wrapStandardPrimitive"
          : node.intrinsic === "aran.deadzone_symbol"
            ? "wrapSymbolPrimitive"
            : "wrap",
        node,
        node.tag,
      );
    }
    case "PrimitiveExpression": {
      return intercept("wrapStandardPrimitive", node, node.tag);
    }
    case "ConditionalExpression": {
      return {
        ...node,
        test: unwrap(visitExpression(node.test), node.tag),
        consequent: visitExpression(node.consequent),
        alternate: visitExpression(node.alternate),
      };
    }
    case "ImportExpression": {
      return intercept("wrap", node, node.tag);
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
        code: intercept(
          "weaveEvalProgram",
          unwrap(visitExpression(node.code), node.tag),
          node.tag,
        ),
      };
    }
    case "AwaitExpression": {
      return intercept(
        "wrap",
        {
          ...node,
          promise: unwrap(visitExpression(node.promise), node.tag),
        },
        node.tag,
      );
    }
    case "YieldExpression": {
      return intercept(
        "wrap",
        {
          ...node,
          item: unwrap(visitExpression(node.item), node.tag),
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
