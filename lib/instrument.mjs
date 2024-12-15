import { LinvailTypeError } from "./error.mjs";
import { concat3, map } from "./util.mjs";

///////////////
// Intercept //
///////////////

export const advice = {
  "apply": /** @type {import("./instrument").Variable} */ ("__LINVAIL_APPLY__"),
  "construct": /** @type {import("./instrument").Variable} */ (
    "__LINVAIL_CONSTRUCT__"
  ),
  "leave-branch": /** @type {import("./instrument").Variable} */ (
    "__LINVAIL_LEAVE_BRANCH__"
  ),
  "enter-primitive": /** @type {import("./instrument").Variable} */ (
    "__LINVAIL_ENTER_PRIMITIVE__"
  ),
  "internalize-closure": /** @type {import("./instrument").Variable} */ (
    "__LINVAIL_INTERNALIZE_CLOSURE__"
  ),
  "enter": /** @type {import("./instrument").Variable} */ ("__LINVAIL_ENTER__"),
  "leave": /** @type {import("./instrument").Variable} */ ("__LINVAIL_LEAVE__"),
};

/**
 * @type {<T>(
 *   kind: (
 *     | "leave-branch"
 *     | "enter-primitive"
 *     | "internalize-closure"
 *     | "enter"
 *     | "leave"
 *   ),
 *   node: import("./instrument").Expression<T>,
 *   tag: T,
 * ) => import("./instrument").Expression<T>}
 */
export const intercept = (kind, node, tag) => ({
  type: "ApplyExpression",
  callee: {
    type: "ReadExpression",
    variable: advice[kind],
    tag,
  },
  this: {
    type: "IntrinsicExpression",
    intrinsic: "undefined",
    tag,
  },
  arguments: [node],
  tag,
});

/**
 * @type {<T>(
 *   variable: import("./instrument").Parameter,
 *   tag: T,
 * ) => import("./instrument").Statement<T>}
 */
export const initializeParameter = (variable, tag) => ({
  type: "EffectStatement",
  inner: {
    type: "WriteEffect",
    variable,
    value: intercept(
      "enter",
      {
        type: "ReadExpression",
        variable,
        tag,
      },
      tag,
    ),
    tag,
  },
  tag,
});

/**
 * @type {<T>(
 *   variable: import("./instrument").Variable,
 *   tag: T,
 * ) => import("./instrument").Statement<T>}
 */
export const initializeVariable = (variable, tag) => ({
  type: "EffectStatement",
  inner: {
    type: "WriteEffect",
    variable,
    value: intercept(
      "enter-primitive",
      {
        type: "ReadExpression",
        variable,
        tag,
      },
      tag,
    ),
    tag,
  },
  tag,
});

/**
 * @type {<T>(
 *   callee: import("./instrument").Expression<T>,
 *   that: import("./instrument").Expression<T>,
 *   args: import("./instrument").Expression<T>[],
 *   tag: T,
 * ) => import("./instrument").Expression<T>}
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
 *   callee: import("./instrument").Expression<T>,
 *   args: import("./instrument").Expression<T>[],
 *   tag: T,
 * ) => import("./instrument").Expression<T>}
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

///////////
// Visit //
///////////

/**
 * @type {<T>(
 *   node: import("./instrument").Program<T>,
 * ) => import("./instrument").Program<T>}
 */
export const intrumentProgram = (node) => {
  if (node.kind === "eval") {
    return {
      ...node,
      body: instrumentRoutineBlock(`${node.kind}.${node.situ}`, node.body),
    };
  } else {
    return {
      ...node,
      body: instrumentRoutineBlock(`${node.kind}.${node.situ}`, node.body),
    };
  }
};

/**
 * @type {<T>(
 *   kind:  "catch" | "other",
 *   node: import("./instrument").SegmentBlock<T>,
 * ) => import("./instrument").SegmentBlock<T>}
 */
const instrumentSegmentBlock = (kind, node) => ({
  ...node,
  body: concat3(
    kind === "catch" ? [initializeParameter("catch.error", node.tag)] : [],
    map(node.bindings, ({ 0: variable }) =>
      initializeVariable(variable, node.tag),
    ),
    map(node.body, instrumentStatement),
  ),
});

/**
 * @type {<T, K extends (
 *   | "module.global"
 *   | "script.global"
 *   | "eval.global"
 *   | "eval.local.root"
 *   | "eval.local.deep"
 *   | "arrow"
 *   | "method"
 *   | "generator"
 *   | "function"
 * )>(
 *   kind: K,
 *   node: (
 *     & import("./instrument").RoutineBlock<T>
 *     & { head: K extends "generator" ? import("./instrument").Effect<T>[] : null }
 *   ),
 * ) => (
 *   & import("./instrument").RoutineBlock<T>
 *   & { head: K extends "generator" ? import("./instrument").Effect<T>[] : null }
 * )}
 */
const instrumentRoutineBlock = (kind, node) => {
  return TODO;
};

/**
 * @type {<T>(
 *   node: import("./instrument").Statement<T>,
 * ) => import("./instrument").Statement<T>}
 */
const instrumentStatement = (node) => {
  switch (node.type) {
    case "EffectStatement": {
      return {
        ...node,
        inner: instrumentEffect(node.inner),
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
        body: instrumentSegmentBlock("other", node.body),
      };
    }
    case "IfStatement": {
      return {
        ...node,
        test: intercept(
          "leave-branch",
          instrumentExpression(node.test),
          node.tag,
        ),
        then: instrumentSegmentBlock("other", node.then),
        else: instrumentSegmentBlock("other", node.else),
      };
    }
    case "WhileStatement": {
      return {
        ...node,
        test: intercept(
          "leave-branch",
          instrumentExpression(node.test),
          node.tag,
        ),
        body: instrumentSegmentBlock("other", node.body),
      };
    }
    case "TryStatement": {
      return {
        ...node,
        try: instrumentSegmentBlock("other", node.try),
        catch: instrumentSegmentBlock("catch", node.catch),
        finally: instrumentSegmentBlock("other", node.finally),
      };
    }
    default: {
      throw new LinvailTypeError(node);
    }
  }
};

/**
 * @type {<T>(
 *   node: import("./instrument").Effect<T>,
 * ) => import("./instrument").Effect<T>}
 */
const instrumentEffect = (node) => {
  switch (node.type) {
    case "ConditionalEffect": {
      return {
        ...node,
        test: intercept(
          "leave-branch",
          instrumentExpression(node.test),
          node.tag,
        ),
        positive: map(node.positive, instrumentEffect),
        negative: map(node.negative, instrumentEffect),
      };
    }
    case "ExportEffect": {
      return {
        ...node,
        value: intercept("leave", instrumentExpression(node.value), node.tag),
      };
    }
    case "WriteEffect": {
      return {
        ...node,
        value: instrumentExpression(node.value),
      };
    }
    case "ExpressionEffect": {
      return {
        ...node,
        discard: instrumentExpression(node.discard),
      };
    }
    default: {
      throw new LinvailTypeError(node);
    }
  }
};

/**
 * @type {<T>(
 *   node: import("./instrument").Expression<T>,
 * ) => import("./instrument").Expression<T>}
 */
const instrumentExpression = (node) => {
  switch (node.type) {
    case "ApplyExpression": {
      return interceptApply(
        instrumentExpression(node.callee),
        instrumentExpression(node.this),
        map(node.arguments, instrumentExpression),
        node.tag,
      );
    }
    case "ConstructExpression": {
      return interceptConstruct(
        instrumentExpression(node.callee),
        map(node.arguments, instrumentExpression),
        node.tag,
      );
    }
    case "ClosureExpression": {
      if (node.kind === "generator") {
        return intercept(
          "internalize-closure",
          { ...node, body: instrumentRoutineBlock("generator", node.body) },
          node.tag,
        );
      } else {
        return intercept(
          "internalize-closure",
          { ...node, body: instrumentRoutineBlock(node.kind, node.body) },
          node.tag,
        );
      }
    }
    case "ReadExpression": {
      return node;
    }
    case "IntrinsicExpression": {
      return intercept("enter", node, node.tag);
    }
    case "PrimitiveExpression": {
      return intercept("enter-primitive", node, node.tag);
    }
    case "ConditionalExpression": {
      return {
        ...node,
        test: intercept(
          "leave-branch",
          instrumentExpression(node.test),
          node.tag,
        ),
        consequent: instrumentExpression(node.consequent),
        alternate: instrumentExpression(node.alternate),
      };
    }
    case "ImportExpression": {
      return intercept("enter", node, node.tag);
    }
    case "SequenceExpression": {
      return {
        ...node,
        head: map(node.head, instrumentEffect),
        tail: instrumentExpression(node.tail),
      };
    }
    case "EvalExpression": {
      return {
        ...node,
        code: intercept("leave", node.code, node.tag),
      };
    }
    case "AwaitExpression": {
      return intercept(
        "enter",
        {
          ...node,
          promise: intercept("leave", node.promise, node.tag),
        },
        node.tag,
      );
    }
    case "YieldExpression": {
      return intercept(
        "enter",
        {
          ...node,
          item: intercept("leave", node.item, node.tag),
        },
        node.tag,
      );
    }
    default: {
      throw new LinvailTypeError(node);
    }
  }
};
