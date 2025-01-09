import { LinvailExecError } from "../error.mjs";
import { concat2, map } from "../util/array.mjs";
import { hasOwnNarrow, listKey } from "../util/record.mjs";
import { split } from "../util/string.mjs";
import { Map } from "../util/collection.mjs";

/**
 * @type {{
 *   [key in import("./naming").GlobalName]: null
 * }}
 */
const global_name_record = {
  // Reflect //
  "Reflect.apply": null,
  "Reflect.construct": null,
  "Reflect.getPrototypeOf": null,
  "Reflect.setPrototypeOf": null,
  "Reflect.isExtensible": null,
  "Reflect.preventExtensions": null,
  "Reflect.deleteProperty": null,
  "Reflect.defineProperty": null,
  "Reflect.getOwnPropertyDescriptor": null,
  "Reflect.ownKeys": null,
  "Reflect.has": null,
  "Reflect.get": null,
  "Reflect.set": null,
  // Object //
  "Object.create": null,
  // Array //
  "Array.of": null,
};

const global_name_array = listKey(global_name_record);

/**
 * @type {{
 *   [key in import("./naming").AranName]: null
 * }}
 */
const aran_name_record = {
  "aran.get": null,
  "aran.createObject": null,
  "aran.sliceObject": null,
  "aran.listForInKey": null,
};

const aran_name_array = listKey(aran_name_record);

/**
 * @type {(
 *   root: import("aran/lib/lang/syntax").AranIntrinsicRecord,
 *   name: import("./naming").AranName,
 * ) => [Function, import("./naming").Name]}
 */
const toAranEntry = (root, name) => [root[name], name];

/**
 * @type {(
 *   root: typeof globalThis,
 *   name: import("./naming").GlobalName,
 * ) => [Function, import("./naming").Name]}
 */
const toGlobalEntry = (root, name) => {
  const segments = split(name, ".");
  const { length } = segments;
  let current = /** @type {any} */ (root);
  for (let index = 0; index < length; index++) {
    const key = segments[index];
    if (hasOwnNarrow(current, key)) {
      current = current[key];
    } else {
      throw new LinvailExecError("Cannot find global name", {
        name,
        segments,
        index,
        key,
        root,
      });
    }
  }
  if (typeof current !== "function") {
    throw new LinvailExecError("Global name is not a function", {
      name,
      current,
      root,
    });
  }
  return [current, name];
};

/**
 * @type {(
 *   root: import("aran/lib/lang/syntax").AranIntrinsicRecord,
 * ) => import("./naming").Naming}
 */
export const recordName = (root) =>
  new Map(
    concat2(
      map(global_name_array, (name) =>
        toGlobalEntry(root["aran.global"], name),
      ),
      map(aran_name_array, (name) => toAranEntry(root, name)),
    ),
  );
