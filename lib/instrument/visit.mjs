import { LinvailTypeError } from "../error.mjs";
import { concat2, concat3, flaten, map } from "../util.mjs";
import {
  initializeExternal,
  initializeInternal,
  initializeParameter,
  isProgramKind,
  returnResult,
  sanitizeClosure,
} from "./helper.mjs";
import {
  capture,
  externalize,
  interceptApply,
  interceptConstruct,
  internalize,
  release,
  setupAdvice,
} from "./intercept.mjs";

const TEMPORARY = /** @type {import(".").Variable} */ ("__LINVAIL_TEMPORARY__");

/**
 * @type {<T>(
 *   node: import(".").Program<T>,
 * ) => import(".").Program<T>}
 */
export const visitProgram = (node) => {
  if (node.kind === "eval") {
    return {
      ...node,
      body: visitRoutineBlock(`${node.kind}.${node.situ}`, node.body),
    };
  } else {
    return {
      ...node,
      body: visitRoutineBlock(`${node.kind}.${node.situ}`, node.body),
    };
  }
};

/**
 * @type {<T>(
 *   kind:  "catch" | "other",
 *   node: import(".").SegmentBlock<T>,
 * ) => import(".").SegmentBlock<T>}
 */
const visitSegmentBlock = (kind, node) => ({
  ...node,
  body: concat3(
    kind === "catch" ? [initializeExternal("catch.error", node.tag)] : [],
    map(node.bindings, ({ 0: variable }) =>
      initializeInternal(variable, node.tag),
    ),
    map(node.body, visitStatement),
  ),
});

/**
 * @type {<T>(
 *   kind: (
 *     | "generator"
 *     | "generator.async"
 *   ),
 *   node: (
 *     & import(".").RoutineBlock<T>
 *     & { head: import(".").Effect<T>[] }
 *   ),
 * ) => (
 *   & import(".").RoutineBlock<T>
 *   & { head: import(".").Effect<T>[] }
 * )}
 */
const visitGeneratorBlock = (kind, node) => ({
  ...node,
  bindings: concat2([[TEMPORARY, "undefined"]], node.bindings),
  head: map(node.head, visitEffect),
  body: concat3(
    initializeParameter(kind, node.tag),
    map(node.bindings, ({ 0: variable }) =>
      initializeInternal(variable, node.tag),
    ),
    map(node.body, visitStatement),
  ),
  tail: returnResult(kind, visitExpression(node.tail), node.tag),
});

/**
 * @type {<T>(
 *   kind: Exclude<
 *     import(".").RoutineKind,
 *     "generator" | "generator.async"
 *   >,
 *   node: import(".").RoutineBlock<T> & { head: null },
 * ) => import(".").RoutineBlock<T> & { head: null }}
 */
const visitRoutineBlock = (kind, node) => ({
  ...node,
  bindings: concat2([[TEMPORARY, "undefined"]], node.bindings),
  head: null,
  body: flaten([
    isProgramKind(kind) ? setupAdvice(node.tag) : [],
    initializeParameter(kind, node.tag),
    map(node.bindings, ({ 0: variable }) =>
      initializeInternal(variable, node.tag),
    ),
    map(node.body, visitStatement),
  ]),
  tail: returnResult(kind, visitExpression(node.tail), node.tag),
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
        body: visitSegmentBlock("other", node.body),
      };
    }
    case "IfStatement": {
      return {
        ...node,
        test: release(visitExpression(node.test), node.tag),
        then: visitSegmentBlock("other", node.then),
        else: visitSegmentBlock("other", node.else),
      };
    }
    case "WhileStatement": {
      return {
        ...node,
        test: release(visitExpression(node.test), node.tag),
        body: visitSegmentBlock("other", node.body),
      };
    }
    case "TryStatement": {
      return {
        ...node,
        try: visitSegmentBlock("other", node.try),
        catch: visitSegmentBlock("catch", node.catch),
        finally: visitSegmentBlock("other", node.finally),
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
        test: release(visitExpression(node.test), node.tag),
        positive: map(node.positive, visitEffect),
        negative: map(node.negative, visitEffect),
      };
    }
    case "ExportEffect": {
      return {
        ...node,
        value: externalize(
          release(visitExpression(node.value), node.tag),
          node.tag,
        ),
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
      return capture(
        {
          type: "SequenceExpression",
          head: concat2(
            [
              {
                type: "WriteEffect",
                variable: TEMPORARY,
                value:
                  node.kind === "generator"
                    ? {
                        ...node,
                        body: visitGeneratorBlock(
                          node.asynchronous ? `${node.kind}.async` : node.kind,
                          node.body,
                        ),
                      }
                    : {
                        ...node,
                        body: visitRoutineBlock(
                          node.asynchronous ? `${node.kind}.async` : node.kind,
                          node.body,
                        ),
                      },
                tag: node.tag,
              },
            ],
            sanitizeClosure(
              node.kind === "generator" ||
                (node.kind === "function" && !node.asynchronous),
              TEMPORARY,
              node.tag,
            ),
          ),
          tail: {
            type: "ReadExpression",
            variable: TEMPORARY,
            tag: node.tag,
          },
          tag: node.tag,
        },
        node.tag,
      );
    }
    case "ReadExpression": {
      return node;
    }
    case "IntrinsicExpression": {
      return capture(internalize(node, node.tag), node.tag);
    }
    case "PrimitiveExpression": {
      return capture(node, node.tag);
    }
    case "ConditionalExpression": {
      return {
        ...node,
        test: release(visitExpression(node.test), node.tag),
        consequent: visitExpression(node.consequent),
        alternate: visitExpression(node.alternate),
      };
    }
    case "ImportExpression": {
      return capture(internalize(node, node.tag), node.tag);
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
        code: externalize(release(node.code, node.tag), node.tag),
      };
    }
    case "AwaitExpression": {
      return capture(
        internalize(
          {
            ...node,
            promise: externalize(release(node.promise, node.tag), node.tag),
          },
          node.tag,
        ),
        node.tag,
      );
    }
    case "YieldExpression": {
      return capture(
        internalize(
          {
            ...node,
            item: externalize(release(node.item, node.tag), node.tag),
          },
          node.tag,
        ),
        node.tag,
      );
    }
    default: {
      throw new LinvailTypeError(node);
    }
  }
};
