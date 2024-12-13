const {
  Object: { hasOwn },
} = globalThis;

/**
 * @type {<X, Y>(
 *   xs: X[],
 *   f: (x: X) => Y,
 * ) => Y[]}
 */
export const map = (array1, transform) => {
  const { length } = array1;
  const array2 = new Array(length);
  for (let index = 0; index < length; index++) {
    array2[index] = transform(array1[index]);
  }
  return array2;
};

/**
 * @type {<O, K extends PropertyKey, V>(
 *   object: O,
 *   key: K
 * ) => object is O & { [k in K]: V }}
 */
export const hasOwnNarrow = /** @type {any} */ (hasOwn);

/**
 * @type {<X>(
 *   array: X[],
 *   index: number,
 *   recover: X,
 * ) => X}
 */
export const at = (array, index, recover) =>
  array.length > index ? array[index] : recover;
