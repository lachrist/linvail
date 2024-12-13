import { compileProxify } from "./reflect.mjs";

const {
  Reflect: { apply },
  WeakMap,
  WeakMap: {
    prototype: { has: hasWeakMap, get: getWeakMap, set: setWeakMap },
  },
} = globalThis;

/**
 * @template I
 * @template E
 * @param {{
 *   isInternalPrimitive: (value: import("./membrane").Value<I>) => value is I,
 *   isExternalPrimitive: (value: import("./membrane").Value<E>) => value is E,
 *   enterPrimitive: (primitive: E) => I,
 *   leavePrimitive: (primitive: I) => E,
 * }} membrane
 * @return {import("./membrane").Membrane<I, E>}
 */
export const createMembrane = ({
  isExternalPrimitive,
  isInternalPrimitive,
  enterPrimitive,
  leavePrimitive,
}) => {
  /**
   * @type {WeakMap<
   *   import("./membrane").ReferenceValue<I>,
   *   import("./membrane").ReferenceValue<E>
   * >}
   */
  const externals = new WeakMap();
  /**
   * @type {WeakMap<
   *   import("./membrane").ReferenceValue<E>,
   *   import("./membrane").ReferenceValue<I>
   * >}
   */
  const internals = new WeakMap();
  /**
   * @type {(
   *   value: import("./membrane").ReferenceValue<E>,
   * ) => import("./membrane").ReferenceValue<I>}
   */
  const enterReference = (value) => {
    if (apply(hasWeakMap, internals, [value])) {
      return apply(getWeakMap, internals, [value]);
    } else {
      const proxy = toInternalProxy(value);
      apply(setWeakMap, internals, [value, proxy]);
      apply(setWeakMap, externals, [proxy, value]);
      return proxy;
    }
  };
  /**
   * @type {(
   *   value: import("./membrane").ReferenceValue<I>,
   * ) => import("./membrane").ReferenceValue<E>}
   */
  const leaveReference = (value) => {
    if (apply(hasWeakMap, internals, [value])) {
      return apply(getWeakMap, internals, [value]);
    } else {
      const proxy = toExternalProxy(value);
      apply(setWeakMap, externals, [value, proxy]);
      apply(setWeakMap, internals, [proxy, value]);
      return proxy;
    }
  };
  /**
   * @type {(
   *   value: import("./membrane").Value<E>,
   * ) => import("./membrane").Value<I>}
   */
  const enterValue = (value) =>
    isExternalPrimitive(value) ? enterPrimitive(value) : enterReference(value);
  /**
   * @type {(
   *   value: import("./membrane").Value<I>,
   * ) => import("./membrane").Value<E>}
   */
  const leaveValue = (value) =>
    isInternalPrimitive(value) ? leavePrimitive(value) : leaveReference(value);
  const toInternalProxy = compileProxify({
    enterValue,
    leaveValue,
    enterReference,
    leaveReference,
  });
  const toExternalProxy = compileProxify({
    enterValue: leaveValue,
    leaveValue: enterValue,
    enterReference: leaveReference,
    leaveReference: enterReference,
  });
  return {
    enter: enterValue,
    leave: leaveValue,
    enterPrimitive,
    leavePrimitive,
    enterValue,
    leaveValue,
    enterReference,
    leaveReference,
  };
};
