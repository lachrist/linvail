// ./lib/instrument

import { ok } from "node:assert";

const assert = /** @type {(check: boolean, message: string) => void} */ (ok);

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

// ExportEffect //
export const foo = 123;
assert((await import(import.meta.url)).foo === 123, "ExportEffect");

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
