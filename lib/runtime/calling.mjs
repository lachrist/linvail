import { getMap } from "../collection.mjs";
import { isPrimitive, map } from "../util.mjs";

const { undefined, Map } = globalThis;

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
const externalize = convert;

/**
 * @type {<X>(
 *   value: import("./reflect").RawValue,
 *   internalizeReference: (
 *     value: import("./reflect").RawReference,
 *   ) => import("./reflect").Reference<X>,
 * ) => import("./reflect").Value<X>}
 */
const _internalize = convert;

///////////
// Apply //
///////////

/**
 * @type {(<X>(context: import("./calling").Context<X>) => [
 *   Function,
 *   (that: X, args: X[]) => X,
 * ])[]}
 */
const applications = [
  // linvail.same //
  ({ linvail: { same: callee }, capture }) => [
    callee,
    (_that, args) =>
      capture(callee(atHandle(args, 0, capture), atHandle(args, 1, capture))),
  ],
  // linvail.inspect //
  ({
    linvail: { inspect: callee },
    capture,
    release,
    externalizeReference,
    global: {
      Reflect: { apply },
    },
  }) => [
    callee,
    (that, args) =>
      capture(
        apply(callee, externalize(release(that), externalizeReference), [
          atHandle(args, 0, capture),
        ]),
      ),
  ],
  // aran.get //
  ({ aran: { get: callee }, release, externalizeReference }) => [
    callee,
    (_that, args) =>
      callee(
        atValue(args, 0, release),
        externalize(atValue(args, 1, release), externalizeReference),
      ),
  ],
];

/**
 * @type {<X>(
 *   context: import("./calling").Context<X>,
 * ) => (callee: X, that: X, args: X[]) => X}
 */
const compileApply = (context) => {
  const {
    global: {
      Reflect: { apply },
    },
    externalizeReference,
    release,
  } = context;
  const record = new Map(map(applications, (compile) => compile(context)));
  return (callee, that, args) => {
    const callee_value = release(callee);
    if (isPrimitive(callee_value)) {
      return apply(/** @type {any} */ (callee_value), that, args);
    } else {
      const external_callee_value = externalizeReference(callee_value);
      const oracle = getMap(record, /** @type {any} */ (external_callee_value));
      if (oracle) {
        return oracle(that, args);
      } else {
        return apply(/** @type {any} */ (callee_value), that, args);
      }
    }
  };
};

////////////
// Export //
////////////

/**
 * @type {(<X>(context: import("./calling").Context<X>) => [
 *   Function,
 *   (args: X[], new_target: X) => X,
 * ])[]}
 */
const constructions = [];

/**
 * @type {<X>(
 *   context: import("./calling").Context<X>,
 * ) => (callee: X, args: X[], new_target: X) => X}
 */
const compileConstruct = (context) => {
  const {
    global: {
      Reflect: { construct },
    },
    externalizeReference,
    release,
  } = context;
  const record = new Map(map(constructions, (compile) => compile(context)));
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
      const oracle = getMap(record, /** @type {any} */ (external_callee_value));
      if (oracle) {
        return oracle(args, new_target);
      } else {
        return construct(
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
 *   cage: import("./cage").Cage<X>,
 *   membrane: import("./membrane").Membrane<X, import("./reflect").RawValue>,
 * ) => {
 *   apply: (callee: X, that: X, args: X[]) => X;
 *   construct: (callee: X, args: X[], new_target: X) => X;
 * }}
 */
export const compileCalling = (global, aran, linvail, cage, membrane) => {
  const context = { global, aran, linvail, ...cage, ...membrane };
  return {
    apply: compileApply(context),
    construct: compileConstruct(context),
  };
};
