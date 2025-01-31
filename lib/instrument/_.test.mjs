const {
  Error,
  Promise,
  undefined,
  Reflect: { getPrototypeOf },
} = globalThis;

/** @type {(check: boolean, message: string) => void} */
const assert = (check, message) => {
  if (!check) {
    throw new Error(message);
  }
};

///////////////
// Statement //
///////////////

// EffectStatement //
{
  let x = 123;
  x = 456;
  assert(x === 456, "EffectStatement");
}

// BreakStatement //
{
  let x = 123;
  l: {
    x = 456;
    break l;
    // eslint-disable-next-line no-unreachable
    x = 789;
  }
  assert(x === 456, "BreakStatement");
}

// DebuggerStatement //
{
  let x = 123;
  x = 456;
  // eslint-disable-next-line no-debugger
  debugger;
  x = 789;
  assert(x === 789, "DebuggerStatement");
}

// BlockStatement //
{
  let x = 123;
  // eslint-disable-next-line no-lone-blocks
  {
    x = 456;
  }
  assert(x === 456, "BlockStatement");
}

// IfStatement //
{
  let x = 123;
  if (true) {
    x = 456;
  } else {
    x = 789;
  }
  assert(x === 456, "IfStatement.then");
}
{
  let x = 123;
  if (false) {
    x = 456;
  } else {
    x = 789;
  }
  assert(x === 789, "IfStatement.else");
}

// WhileStatement //
{
  let x = 0;
  while (x < 3) {
    x++;
  }
  assert(x === 3, "WhileStatement");
}

// TryStatement //
{
  let x = 123;
  try {
    throw 456;
  } catch (e) {
    x = /** @type {number} */ (e);
  }
  assert(x === 456, "TryStatement.catch");
}
{
  let x = 123;
  try {
    x = 456;
  } finally {
    x = 789;
  }
  assert(x === 789, "TryStatement.finally");
}

////////////
// Effect //
////////////

// ExpressionEffect //
{
  const o = /** @type {{k: number}} */ ({ k: 123 });
  o.k = 456;
  assert(o.k === 456, "ExpressionEffect");
}

// ExportEffect & ImportExpression //
export let specifier = 123;
specifier = 456;
import { specifier as indirect_specifier } from "./_.test.mjs";
assert(indirect_specifier === 456, "ExportEffect");
// assert((await import(import.meta.url)).foo === 123, "ExportEffect");

// WriteEffect //
{
  let x = 123;
  x = 456;
  assert(x === 456, "WriteEffect");
}

// ConditionalEffect //
{
  let x = 123;
  true ? (x = 456) : (x = 789);
  assert(x === 456, "ConditionalEffect.positive");
}
{
  let x = 123;
  false ? (x = 456) : (x = 789);
  assert(x === 789, "ConditionalEffect.negative");
}

////////////////
// Expression //
////////////////

// PrimitiveExpression //
assert(123 === 123, "PrimitiveExpression");

// ImportExpression //
// cf ExportEffect

// IntrinsicExpression //
assert(2 + 3 === 5, "IntrinsicExpression"); // %aran.binary

// ReadExpression //
{
  const x = 123;
  assert(x === 123, "ReadExpression");
}

// SequenceExpression //
{
  let x = 123;
  assert(((x = 456), 789) === 789, "SequenceExpression.tail");
  assert(x === 456, "SequenceExpression.head");
}

// ConditionalExpression //
assert((true ? 456 : 789) === 456, "ConditionalExpression.consequent");
assert((false ? 456 : 789) === 789, "ConditionalExpression.alternate");

// ClosureExpression >> Arrow //
{
  const that = this;
  /** @type {(...args: number[]) => number} */
  const f = (...xs) => {
    assert(that === this, "ClosureExpression.arrow.this");
    assert(xs.length === 2, "ClosureExpression.arrow.args.length");
    assert(xs[0] === 123, "ClosureExpression.arrow.args.0");
    assert(xs[1] === 456, "ClosureExpression.arrow.args.1");
    return 789;
  };
  assert(f(123, 456) === 789, "ClosureExpression.arrow.result");
}
{
  /** @type {() => Promise<string>} */
  const f = async () => (await "foo") + (await Promise.resolve("bar"));
  assert((await f()) === "foobar", "ClosureExpression.arrow.result.async");
}

// ClosureExpression >> Method //
{
  const o = {
    /** @type {(...args: number[]) => number} */
    m(...xs) {
      assert(this === o, "ClosureExpression.method.this");
      // @ts-ignore
      assert(new.target === undefined, "ClosureExpression.method.new_target");
      assert(xs.length === 2, "ClosureExpression.method.args.length");
      assert(xs[0] === 123, "ClosureExpression.method.args.0");
      assert(xs[1] === 456, "ClosureExpression.method.args.1");
      return 789;
    },
  };
  assert(o.m(123, 456) === 789, "ClosureExpression.result");
}
{
  const o = {
    /** @type {() => Promise<string>} */
    async m() {
      return (await "foo") + (await Promise.resolve("bar"));
    },
  };
  assert((await o.m()) === "foobar", "ClosureExpression.method.async");
}

// ClosureExpression >> Function //
{
  /**
   * @type {(
   *   this: {prototype: object},
   *   ...args: number[]
   * ) => { foo: number }}
   */
  const f = function (...xs) {
    assert(
      this && typeof this === "object",
      "ClosureExpression.function.this.typeof",
    );
    assert(
      getPrototypeOf(this) === f.prototype,
      "ClosureExpression.function.this.prototype",
    );
    assert(new.target === f, "ClosureExpression.function.new_target");
    assert(xs.length === 2, "ClosureExpression.function.args.length");
    assert(xs[0] === 123, "ClosureExpression.function.args.0");
    assert(xs[1] === 456, "ClosureExpression.function.args.1");
    return { foo: 789 };
  };
  assert(
    new /** @type {any} */ (f)(123, 456).foo === 789,
    "ClosureExpression.function0.result",
  );
}
{
  /** @type {() => Promise<string>} */
  const f = async function () {
    return (await "foo") + (await Promise.resolve("bar"));
  };
  assert((await f()) === "foobar", "ClosureExpression.function.async");
}

// ClosureExpression >> Generator //
{
  /** @type {(...args: string[]) => Iterator<number>} */
  const g = function* (...xs) {
    assert(xs.length === 2, "ClosureExpression.generator.args.length");
    assert(xs[0] === "foo", "ClosureExpression.generator.args.0");
    assert(xs[1] === "bar", "ClosureExpression.generator.args.1");
    yield 123;
    yield 456;
    return 789;
  };
  const i = g("foo", "bar");
  assert(i.next().value === 123, "ClosureExpression.generator.yield.1");
  assert(i.next().value === 456, "ClosureExpression.generator.yield.2");
  assert(i.next().value === 789, "ClosureExpression.generator.yield.3");
  assert(i.next().done === true, "ClosureExpression.generator.done");
}
{
  /** @type {(...args: string[]) => AsyncIterator<number>} */
  const g = async function* () {
    yield await 123;
    yield await Promise.resolve(456);
    return 789;
  };
  const i = g();
  assert((await i.next()).value === 123, "ClosureExpression.generator.async.1");
  assert((await i.next()).value === 456, "ClosureExpression.generator.async.2");
  assert((await i.next()).value === 789, "ClosureExpression.generator.async.3");
  assert(
    (await i.next()).done === true,
    "ClosureExpression.generator.async.done",
  );
}
