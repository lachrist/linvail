import { strictEqual as assertEqual } from "node:assert";
import { toSpecifier } from "./specifier.mjs";

assertEqual(toSpecifier("a/b/c", "a/b/"), "./c");
assertEqual(toSpecifier("a/b/c", "a/b"), "./c");
assertEqual(toSpecifier("a/b/c/", "a/b"), "./c");
assertEqual(toSpecifier("a/b1/c", "a/b2"), "../b1/c");
assertEqual(toSpecifier("a/b1/c1/d", "a/b2/c2"), "../../b1/c1/d");
