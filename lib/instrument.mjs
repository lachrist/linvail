import { LinvailTypeError } from "./error.mjs";
import { map } from "./util.mjs";

///////////////
// Intercept //
///////////////

export const APPLY_VARIABLE = /** @type {import("./instrument").Variable} */ (
  "__LINVAIL_APPLY__"
);
export const CONSTRUCT_VARIABLE =
  /** @type {import("./instrument").Variable} */ ("__LINVAIL_CONSTRUCT__");
export const BRANCH_VARIABLE = /** @type {import("./instrument").Variable} */ (
  "__LINVAIL_BRANCH__"
);
export const PRIMITIVE_VARIABLE =
  /** @type {import("./instrument").Variable} */ ("__LINVAIL_PRIMITIVE__");
export const ENTER_VARIABLE = /** @type {import("./instrument").Variable} */ (
  "__LINVAIL_ENTER__"
);
export const LEAVE_VARIABLE = /** @type {import("./instrument").Variable} */ (
  "__LINVAIL_LEAVE__"
);
export const CLOSURE_VARIABLE = /** @type {import("./instrument").Variable} */ (
  "__LINVAIL_CLOSURE__"
);

export const advice = {
  "apply": APPLY_VARIABLE,
  "construct": CONSTRUCT_VARIABLE,
  "branch": BRANCH_VARIABLE,
  "primitive": PRIMITIVE_VARIABLE,
  "intrinsic": ENTER_VARIABLE,
  "arrow": CLOSURE_VARIABLE,
  "generator": CLOSURE_VARIABLE,
  "function": CLOSURE_VARIABLE,
  "method": CLOSURE_VARIABLE,
  "export": LEAVE_VARIABLE,
  "import": ENTER_VARIABLE,
  "eval": LEAVE_VARIABLE,
  "await-promise": LEAVE_VARIABLE,
  "await-result": ENTER_VARIABLE,
  "yield-item": LEAVE_VARIABLE,
  "yield-result": ENTER_VARIABLE,
};

/**
 * @type {<T>(
 *   kind: (
 *     | "branch"
 *     | "primitive"
 *     | "intrinsic"
 *     | "arrow"
 *     | "method"
 *     | "function"
 *     | "generator"
 *     | "import"
 *     | "export"
 *     | "eval"
 *     | "await-promise"
 *     | "await-result"
 *     | "yield-item"
 *     | "yield-result"
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
export const intrumentProgram = (node) => ({
  ...node,
  body: instrumentHeadlessRoutineBlock(node.body),
});

/**
 * @type {<T>(
 *   node: import("./instrument").SegmentBlock<T>,
 * ) => import("./instrument").SegmentBlock<T>}
 */
const instrumentSegmentBlock = (node) => ({
  ...node,
  body: map(node.body, instrumentStatement),
});

/**
 * @type {<T>(
 *   node: import("./instrument").HeadfulRoutineBlock<T>,
 * ) => import("./instrument").HeadfulRoutineBlock<T>}
 */
const instrumentHeadfulRoutineBlock = (node) => ({
  ...node,
  head: map(node.head, instrumentEffect),
  body: map(node.body, instrumentStatement),
});

/**
 * @type {<T>(
 *   node: import("./instrument").HeadlessRoutineBlock<T>,
 * ) => import("./instrument").HeadlessRoutineBlock<T>}
 */
const instrumentHeadlessRoutineBlock = (node) => ({
  ...node,
  body: map(node.body, instrumentStatement),
});

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
        body: instrumentSegmentBlock(node.body),
      };
    }
    case "IfStatement": {
      return {
        ...node,
        test: intercept("branch", instrumentExpression(node.test), node.tag),
        then: instrumentSegmentBlock(node.then),
        else: instrumentSegmentBlock(node.else),
      };
    }
    case "WhileStatement": {
      return {
        ...node,
        test: intercept("branch", instrumentExpression(node.test), node.tag),
        body: instrumentSegmentBlock(node.body),
      };
    }
    case "TryStatement": {
      return {
        ...node,
        try: instrumentSegmentBlock(node.try),
        catch: instrumentSegmentBlock(node.catch),
        finally: instrumentSegmentBlock(node.finally),
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
        test: intercept("branch", instrumentExpression(node.test), node.tag),
        positive: map(node.positive, instrumentEffect),
        negative: map(node.negative, instrumentEffect),
      };
    }
    case "ExportEffect": {
      return {
        ...node,
        value: intercept("export", instrumentExpression(node.value), node.tag),
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
          "generator",
          { ...node, body: instrumentHeadfulRoutineBlock(node.body) },
          node.tag,
        );
      } else {
        return intercept(
          node.kind,
          { ...node, body: instrumentHeadlessRoutineBlock(node.body) },
          node.tag,
        );
      }
    }
    case "ReadExpression": {
      return node;
    }
    case "IntrinsicExpression": {
      return intercept("intrinsic", node, node.tag);
    }
    case "PrimitiveExpression": {
      return intercept("primitive", node, node.tag);
    }
    case "ConditionalExpression": {
      return {
        ...node,
        test: intercept("branch", instrumentExpression(node.test), node.tag),
        consequent: instrumentExpression(node.consequent),
        alternate: instrumentExpression(node.alternate),
      };
    }
    case "ImportExpression": {
      return intercept("import", node, node.tag);
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
        code: intercept("eval", node.code, node.tag),
      };
    }
    case "AwaitExpression": {
      return intercept(
        "await-result",
        {
          ...node,
          promise: intercept("await-promise", node.promise, node.tag),
        },
        node.tag,
      );
    }
    case "YieldExpression": {
      return intercept(
        "yield-result",
        {
          ...node,
          item: intercept("yield-item", node.item, node.tag),
        },
        node.tag,
      );
    }
    default: {
      throw new LinvailTypeError(node);
    }
  }
};
