import { deepStrictEqual as assertDeepEqual } from "node:assert";

import { split } from "./string.mjs";

assertDeepEqual(split("foo.bar.qux", "."), ["foo", "bar", "qux"]);

assertDeepEqual(split("foo", "."), ["foo"]);
