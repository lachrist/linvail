/* eslint-disable no-use-before-define */

import compileReflectGet from "./global/Reflect/get.mjs";
import compileReflectHas from "./global/Reflect/has.mjs";
import compileReflectSet from "./global/Reflect/set.mjs";
import compileObjectCreate from "./global/Object/create.mjs";
import compileLinvailSame from "./linvail/same.mjs";
import compileLinvailDir from "./linvail/dir.mjs";
import compileAranGet from "./aran/get.mjs";
import compileArrayOf from "./global/Array/of.mjs";
import { getMap } from "../../collection.mjs";
import { map } from "../../util.mjs";
import { compileReflect } from "./reflect.mjs";
import { compileConvert } from "./convert.mjs";

const { Boolean, Map } = globalThis;

/** @type {import(".").Oracle} */
const MISSING_ORACLE = {
  apply: null,
  construct: null,
};

/**
 * @type {(
 *   map: Map<Function, import(".").Oracle>,
 *   key: import("../domain").PlainExternalReference,
 * ) => undefined | import(".").Oracle}
 */
const getOracle = /** @type {any} */ (getMap);

/**
 * @type {(
 *   config: import(".").Config,
 * ) => {
 *   apply: import("../../advice").Advice["apply"],
 *   construct: import("../../advice").Advice["construct"],
 * }}
 */
export const compileOracle = (config) => {
  const {
    global: {
      TypeError,
      Reflect: { apply, construct },
    },
    region: {
      enterReference,
      isInternalPrimitive,
      leavePrimitive,
      isGuestInternalReference,
      leavePlainExternalReference,
      leaveReference,
      leaveValue,
      enterValue,
    },
  } = config;
  /**
   * @type {(
   *   target: import("../domain").InternalReference,
   *   that: import("../domain").InternalValue,
   *   args: import("../domain").InternalValue[],
   * ) => import("../domain").InternalValue}
   */
  const applyInternalReference = (target, that, args) => {
    if (isInternalPrimitive(target)) {
      return apply(leavePrimitive(target), null, []);
    } else {
      if (isGuestInternalReference(target)) {
        const external = leavePlainExternalReference(target);
        const { apply: oracle } =
          getOracle(oracles, external) ?? MISSING_ORACLE;
        if (oracle) {
          return oracle(that, args);
        } else {
          return enterValue(
            apply(external, leaveValue(that), map(args, leaveValue)),
          );
        }
      } else {
        return apply(target, that, args);
      }
    }
  };
  /**
   * @type {(
   *   target: import("../domain").InternalReference,
   *   args: import("../domain").InternalValue[],
   *   new_target: import("../domain").InternalReference,
   * ) => import("../domain").InternalReference}
   */
  const constructInternalReference = (target, args, new_target) => {
    if (isInternalPrimitive(target)) {
      return construct(leavePrimitive(target), [], Boolean);
    } else if (isInternalPrimitive(new_target)) {
      return construct(leavePrimitive(new_target), [], Boolean);
    } else {
      if (isGuestInternalReference(target)) {
        const external = leavePlainExternalReference(target);
        const { construct: oracle } =
          getOracle(oracles, external) ?? MISSING_ORACLE;
        if (oracle) {
          return oracle(args, new_target);
        } else {
          return enterReference(
            construct(
              external,
              map(args, leaveValue),
              leaveReference(new_target),
            ),
          );
        }
      } else {
        return construct(target, args, new_target);
      }
    }
  };
  const reflect = compileReflect(config.global, config.region, {
    apply: applyInternalReference,
    construct: constructInternalReference,
  });
  const convert = compileConvert({
    global: config.global,
    region: config.region,
    reflect,
  });
  /** @type {import(".").Context} */
  const context = {
    ...config,
    reflect,
    convert,
  };
  const oracles = new Map([
    // Aran //
    compileAranGet(context),
    // Linvail //
    compileLinvailDir(context),
    compileLinvailSame(context),
    // Object //
    compileObjectCreate(context),
    // Reflect //
    compileReflectHas(context),
    compileReflectGet(context),
    compileReflectSet(context),
    // Array //
    compileArrayOf(context),
  ]);
  return {
    apply: (target, that, args) => {
      if (isInternalPrimitive(target)) {
        throw new TypeError("Cannot apply primitive");
      } else {
        return applyInternalReference(target, that, args);
      }
    },
    construct: (target, args) => {
      if (isInternalPrimitive(target)) {
        throw new TypeError("Cannot construct primitive");
      } else {
        return constructInternalReference(target, args, target);
      }
    },
  };
};
