import { strictEqual as assertEqual } from "node:assert";
import { resolveNaN } from "./number.mjs";

const { NaN } = globalThis;

assertEqual(resolveNaN(123, 456), 123);

assertEqual(resolveNaN(NaN, 456), 456);
