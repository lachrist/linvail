import { isPrimitive } from "../util.mjs";

const {
  Reflect: { apply },
  Map,
  Map: {
    prototype: { get: getMapInner },
  },
} = globalThis;

/////////
// Map //
/////////

/**
 * @type {<K, V>(
 *   map: Map<K, V>,
 *   key: K,
 * ) => undefined | V}
 */
const getMap = (map, key) => apply(getMapInner, map, [key]);

////////////
// Helper //
////////////

/**
 * @type {<X>(
 *   array: X[],
 *   index: number,
 *   capture: (value: import("./reflect").Value<X>) => X,
 * ) => X}
 */
const atHandle = (array, index, capture) =>
  array.length > index ? array[index] : capture(undefined);

/**
 * @type {<X>(
 *   array: X[],
 *   index: number,
 *   release: (handle: X) => import("./reflect").Value<X>,
 * ) => import("./reflect").Value<X>}
 */
const atValue = (array, index, release) =>
  array.length > index ? release(array[index]) : undefined;

/**
 * @type {<X, Y>(
 *   value: import("./reflect").Value<X>,
 *   convertReference: (
 *     value: import("./reflect").Reference<X>,
 *   ) => import("./reflect").Reference<Y>,
 * ) => import("./reflect").Value<Y>}
 */
const convert = (value, convertReference) =>
  isPrimitive(value) ? value : convertReference(value);

/**
 * @type {<X>(
 *   value: import("./reflect").Value<X>,
 *   externalizeReference: (
 *     value: import("./reflect").Reference<X>,
 *   ) => import("./reflect").RawReference,
 * ) => import("./reflect").RawValue}
 */
const leave = convert;

/**
 * @type {<X>(
 *   value: import("./reflect").RawValue,
 *   internalizeReference: (
 *     value: import("./reflect").RawReference,
 *   ) => import("./reflect").Reference<X>,
 * ) => import("./reflect").Value<X>}
 */
const enter = convert;

//////////////
// Compiler //
//////////////

/**
 * @type {import("./calling").CompileApply<import("./aran").AranLibrary["get"]>}
 */
const compileAranGet =
  (callee, { release, externalizeReference }) =>
  (_that, args) =>
    callee(
      atValue(args, 0, release),
      leave(atValue(args, 1, release), externalizeReference),
    );

////////////
// Export //
////////////

/**
 * @type {<F, X, C, Y>(
 *   compile: (callee: F, context: C) => Y,
 *   closure: F,
 *   context: C,
 * ) => [
 *   import("./reflect").RawReference,
 *   Y,
 * ]}
 */
const register = (compile, closure, context) => [
  /** @type {import("./reflect").RawReference} */ (closure),
  compile(closure, context),
];

/**
 * @type {<X>(
 *   aran: import("./aran").AranLibrary,
 *   linvail: import("./library").Library,
 *   context: import("./calling").Context<X>
 * ) => [
 *   import("./reflect").RawReference,
 *   (that: X, args: X[]) => X,
 * ][]}
 */
const listApplyEntry = (aran, linvail, context) => [
  register(compileAranGet, aran.get, context),
];

/**
 * @type {<X>(
 *   aran: import("./aran").AranLibrary,
 *   linvail: import("./library").Library,
 *   context: import("./calling").Context<X>
 * ) => [
 *   import("./reflect").RawReference,
 *   (args: X[], new_target: X) => X,
 * ][]}
 */
const listConstructEntry = (_aran, _linvail, _context) => [];

/**
 * @type {<X>(
 *   aran: import("./aran").AranLibrary,
 *   linvail: import("./library").Library,
 *   context: import("./calling").Context<X>,
 * ) => (callee: X, that: X, args: X[]) => X}
 */
const compileApply = (aran, linvail, context) => {
  const {
    global: {
      Reflect: { apply },
    },
    externalizeReference,
    release,
  } = context;
  const record = new Map(listApplyEntry(aran, linvail, context));
  return (callee, that, args) => {
    const callee_value = release(callee);
    if (isPrimitive(callee_value)) {
      return apply(/** @type {any} */ (callee_value), that, args);
    } else {
      const external_callee_value = externalizeReference(callee_value);
      const oracle = getMap(record, external_callee_value);
      if (oracle) {
        return oracle(that, args);
      } else {
        return apply(/** @type {any} */ (callee_value), that, args);
      }
    }
  };
};

/**
 * @type {<X>(
 *   aran: import("./aran").AranLibrary,
 *   linvail: import("./library").Library,
 *   context: import("./calling").Context<X>,
 * ) => (callee: X, args: X[], new_target: X) => X}
 */
const compileConstruct = (aran, linvail, context) => {
  const {
    global: {
      Reflect: { construct },
    },
    externalizeReference,
    release,
  } = context;
  const record = new Map(listConstructEntry(aran, linvail, context));
  return (callee, args, new_target) => {
    const callee_value = release(callee);
    if (isPrimitive(callee_value)) {
      return construct(
        /** @type {any} */ (callee_value),
        args,
        /** @type {any} */ (release(new_target)),
      );
    } else {
      const external_callee_value = externalizeReference(callee_value);
      const oracle = getMap(record, external_callee_value);
      if (oracle) {
        return oracle(args, new_target);
      } else {
        return apply(
          /** @type {any} */ (callee_value),
          args,
          /** @type {any} */ (release(new_target)),
        );
      }
    }
  };
};

/**
 * @type {<X>(
 *   global: typeof globalThis,
 *   aran: import("./aran").AranLibrary,
 *   linvail: import("./library").Library,
 *   lifecycle: import("./lifecycle").Lifecycle<X>,
 *   membrane: import("./membrane").Membrane<X, import("./reflect").RawValue>,
 * ) => {
 *   apply: (callee: X, that: X, args: X[]) => X;
 *   construct: (callee: X, args: X[], new_target: X) => X;
 * }}
 */
export const compileCalling = (global, aran, linvail, lifecycle, membrane) => {
  const context = { global, ...lifecycle, ...membrane };
  return {
    apply: compileApply(aran, linvail, context),
    construct: compileConstruct(aran, linvail, context),
  };
};
