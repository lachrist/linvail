/**
 * @type {(
 *   intrinsics: import("aran").AranIntrinsicRecord,
 * ) => import("./aran").AranLibrary}
 */
export const extractAranLibrary = (intrinsics) => ({
  get: /** @type {any} */ (intrinsics["aran.get"]),
  createObject: /** @type {any} */ (intrinsics["aran.createObject"]),
  sliceObject: /** @type {any} */ (intrinsics["aran.sliceObject"]),
  listForInKey: /** @type {any} */ (intrinsics["aran.listForInKey"]),
});
