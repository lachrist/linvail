import { strictEqual as assertEqual } from "node:assert";

import { isPrimitive } from "./primitive.mjs";

const { undefined, Symbol } = globalThis;

assertEqual(isPrimitive(null), true);

assertEqual(isPrimitive(undefined), true);

assertEqual(isPrimitive(123), true);

assertEqual(isPrimitive(123n), true);

assertEqual(isPrimitive("foo"), true);

assertEqual(isPrimitive(Symbol("bar")), true);

assertEqual(isPrimitive({}), false);

assertEqual(isPrimitive([]), false);

assertEqual(
  isPrimitive(() => {}),
  false,
);
