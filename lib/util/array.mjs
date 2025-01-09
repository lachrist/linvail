const {
  Array: {
    from: toArray,
    prototype: { flat },
  },
  Reflect: { apply },
} = globalThis;

/**
 * @type {<X, Y>(
 *   array: X[],
 *   transform: (element: X, index: number) => Y,
 * ) => Y[]}
 */
export const map = toArray;

/**
 * @type {<X>(
 *   array1: X[],
 *   array2: X[],
 * ) => X[]}
 */
export const concat2 = (array1, array2) => {
  const { length: length1 } = array1;
  const { length: length2 } = array2;
  return toArray({ length: length1 + length2 }, (_, index) =>
    index < length1 ? array1[index] : array2[index - length1],
  );
};

/**
 * @type {<X>(
 *   array1: X[],
 *   array2: X[],
 *   array3: X[],
 * ) => X[]}
 */
export const concat3 = (array1, array2, array3) => {
  const { length: length1 } = array1;
  const { length: length2 } = array2;
  const { length: length3 } = array3;
  const length12 = length1 + length2;
  return toArray({ length: length1 + length2 + length3 }, (_, index) =>
    index < length1
      ? array1[index]
      : index < length12
        ? array2[index - length1]
        : array3[index - length12],
  );
};

/**
 * @type {<X>(
 *   matrix: X[][],
 * ) => X[]}
 */
export const flaten = (matrix) => apply(flat, matrix, []);

/**
 * @type {<X>(
 *   array: X[],
 *   from: number,
 *   to: number,
 * ) => X[]}
 */
export const slice = (array, from, to) =>
  toArray({ length: to - from }, (_, index) => array[index + from]);
