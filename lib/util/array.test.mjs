import { deepStrictEqual as assertDeepEqual } from "node:assert";

import { concat2, concat3, flaten, map, slice } from "./array.mjs";

assertDeepEqual(
  map([1, 2, 3], (element, index) => element + index),
  [1, 3, 5],
);

assertDeepEqual(concat2([1, 2, 3], [4, 5]), [1, 2, 3, 4, 5]);

assertDeepEqual(concat3([1, 2, 3], [4, 5], [6]), [1, 2, 3, 4, 5, 6]);

assertDeepEqual(flaten([]), []);
assertDeepEqual(flaten([[]]), []);
assertDeepEqual(flaten([[], []]), []);
assertDeepEqual(flaten([[], [], []]), []);
assertDeepEqual(flaten([[], [], [1], [2, 3], [4, 5, 6]]), [1, 2, 3, 4, 5, 6]);
assertDeepEqual(flaten([[1, 2, 3], [4, 5], [6], [], []]), [1, 2, 3, 4, 5, 6]);

assertDeepEqual(flaten([[1, 2, 3], [4, 5], [6]]), [1, 2, 3, 4, 5, 6]);

assertDeepEqual(slice([1, 2, 3, 4, 5], 2, 4), [3, 4]);
