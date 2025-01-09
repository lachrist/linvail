const {
  Array,
  Array: {
    prototype: { flat },
  },
  Reflect: { apply },
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
 * @type {<X>(
 *   array1: X[],
 *   array2: X[],
 * ) => X[]}
 */
export const concat2 = (array1, array2) => {
  const { length: length1 } = array1;
  const { length: length2 } = array2;
  const result = new Array(length1 + length2);
  for (let index = 0; index < length1; index++) {
    result[index] = array1[index];
  }
  for (let index = 0; index < length2; index++) {
    result[length1 + index] = array2[index];
  }
  return result;
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
  const result = new Array(length1 + length2 + length3);
  for (let index = 0; index < length1; index++) {
    result[index] = array1[index];
  }
  for (let index = 0; index < length2; index++) {
    result[length1 + index] = array2[index];
  }
  for (let index = 0; index < length3; index++) {
    result[length1 + length2 + index] = array3[index];
  }
  return result;
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
export const slice = (array, from, to) => {
  const result = new Array(to - from);
  for (let index = from; index < to; index++) {
    result[index - from] = array[index];
  }
  return result;
};
