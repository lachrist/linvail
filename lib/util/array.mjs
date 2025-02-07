const {
  Array: { from: toArray },
} = globalThis;

/**
 * @type {<X>(
 *   length: number,
 *   createItem: (value: undefined, index: number) => X,
 * ) => X[]}
 */
const createArray = (length, createItem) =>
  toArray(
    /** @type {{ length: number }} */ ({ __proto__: null, length }),
    createItem,
  );

/**
 * @type {<X, Y>(
 *   array: X[],
 *   transform: (element: X, index: number) => Y,
 * ) => Y[]}
 */
export const map = (array, transform) =>
  createArray(array.length, (_, index) => transform(array[index], index));

/**
 * @type {<X>(
 *   array1: X[],
 *   array2: X[],
 * ) => X[]}
 */
export const concat2 = (array1, array2) => {
  const { length: length1 } = array1;
  const { length: length2 } = array2;
  return createArray(length1 + length2, (_, index) =>
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
  return createArray(length1 + length2 + length3, (_, index) =>
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
export const flaten = (matrix) => {
  let total = 0;
  const { length } = matrix;
  for (let index = 0; index < length; index++) {
    total += matrix[index].length;
  }
  let index1 = 0;
  let index2 = 0;
  const result = createArray(total, (_, _index) => {
    while (index2 === matrix[index1].length) {
      index1++;
      index2 = 0;
    }
    const item = matrix[index1][index2];
    index2++;
    return item;
  });
  return result;
};

/**
 * @type {<X>(
 *   array: X[],
 *   from: number,
 *   to: number,
 * ) => X[]}
 */
export const slice = (array, from, to) =>
  createArray(to - from, (_, index) => array[index + from]);
