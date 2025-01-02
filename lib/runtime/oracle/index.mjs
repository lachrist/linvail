/* eslint-disable no-use-before-define */

import CompileReflectGet from "./reflect/get.mjs";
import CompileReflectHas from "./reflect/has.mjs";
import CompileReflectSet from "./reflect/set.mjs";
import CompileLinvailSame from "./linvail/same.mjs";
import CompileLinvailDir from "./linvail/dir.mjs";
import CompileAranGet from "./aran/get.mjs";
import CompileArrayOf from "./array/of.mjs";
import { getMap } from "../../collection.mjs";
import { map } from "../../util.mjs";

const { Boolean, Map } = globalThis;

/** @type {import("./oracle").Oracle} */
const MISSING_ORACLE = {
  apply: null,
  construct: null,
};

/**
 * @type {(
 *   map: Map<Function, import("./oracle").Oracle>,
 *   key: import("../domain").PlainExternalReference,
 * ) => undefined | import("./oracle").Oracle}
 */
const getOracle = /** @type {any} */ (getMap);

/**
 * @type {(
 *   config: import("./oracle").Config,
 * ) => import("./oracle").Call}
 */
export const compileOracle = (config) => {
  const {
    global: {
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
  /** @type {import("./oracle").Call} */
  const call = {
    apply: (target, that, args) => {
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
    },
    construct: (target, args, new_target) => {
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
    },
  };
  /** @type {import("./oracle").Context} */
  const context = { ...config, ...call };
  const oracles = new Map([
    // Aran //
    CompileAranGet(context),
    // Linvail //
    CompileLinvailDir(context),
    CompileLinvailSame(context),
    // Reflect //
    CompileReflectHas(context),
    CompileReflectGet(context),
    CompileReflectSet(context),
    // Array //
    CompileArrayOf(context),
  ]);
  return call;
};
