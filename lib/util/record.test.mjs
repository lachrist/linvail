import { deepStrictEqual as assertDeepEqual } from "node:assert";

import {
  hasOwnNarrow,
  listEntry,
  listKey,
  listValue,
  reduceEntry,
} from "./record.mjs";

const record = { foo: 123, bar: 456 };

assertDeepEqual(reduceEntry(listEntry(record)), record);

assertDeepEqual(listKey(record), ["foo", "bar"]);

assertDeepEqual(listValue(record), [123, 456]);

assertDeepEqual(hasOwnNarrow(record, "foo"), true);

assertDeepEqual(hasOwnNarrow(record, "qux"), false);
