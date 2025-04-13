const {
  Object: { hasOwn, keys, values, entries, fromEntries },
} = globalThis;

/**
 * @type {<K extends PropertyKey>(
 *   record: { [key in K]: unknown },
 * ) => K[]}
 */

export const listKey = keys;
/**
 * @type {<V>(
 *   record: { [key in PropertyKey]: V },
 * ) => V[]}
 */

export const listValue = values;
/**
 * @type {<K extends PropertyKey, V>(
 *   record: { [key in K]: V },
 * ) => [K, V][]}
 */

export const listEntry = entries;
/**
 * @type {<K extends PropertyKey, V>(
 *   entries: [K, V][],
 * ) => { [key in K]: V }}
 */

export const reduceEntry = fromEntries;

/**
 * @type {<O, K extends PropertyKey, V>(
 *   object: O,
 *   key: K
 * ) => object is O & { [k in K]: V }}
 */

export const hasOwnNarrow = /** @type {any} */ (hasOwn);

/**
 * @type {<K extends PropertyKey>(
 *   key: K,
 * ) => <O extends {[k in K]: unknown}>(obj: O) => O[K]}
 */
export const compileGet = (key) => (obj) => obj[key];
