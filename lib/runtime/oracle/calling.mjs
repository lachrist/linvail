import { getMap } from "../../util/collection.mjs";
import { map } from "../../util/array.mjs";
import {
  isGuestInternalReference,
  leavePlainExternalReference,
} from "../region/core.mjs";
import {
  enterReference,
  enterValue,
  leaveReference,
  leaveValue,
} from "../region/util.mjs";
import { applyPlainInternalReference } from "../region/closure.mjs";

/** @type {import(".").Oracle} */
const MISSING_ORACLE = {
  apply: null,
  construct: null,
};

/**
 * @type {(
 *   region: import("../region").Region,
 *   oracles: import(".").OracleRegistery,
 *   target: import("../domain").InternalReference,
 *   that: import("../domain").InternalValue,
 *   args: import("../domain").InternalValue[],
 * ) => import("../domain").InternalValue}
 */
export const applyInternalReference = (region, oracles, target, that, args) => {
  const {
    global: {
      Reflect: { apply },
    },
  } = region;
  if (isGuestInternalReference(region, target)) {
    const external = leavePlainExternalReference(region, target);
    const { apply: oracle } = getMap(oracles, external) ?? MISSING_ORACLE;
    if (oracle) {
      return oracle(region, oracles, that, args);
    } else {
      return enterValue(
        region,
        apply(
          external,
          leaveValue(region, that),
          map(args, (arg) => leaveValue(region, arg)),
        ),
      );
    }
  } else {
    return applyPlainInternalReference(region, target, that, args);
  }
};

/**
 * @type {(
 *   region: import("../region").Region,
 *   oracles: import(".").OracleRegistery,
 *   target: import("../domain").InternalReference,
 *   args: import("../domain").InternalValue[],
 *   new_target: import("../domain").InternalReference,
 * ) => import("../domain").InternalReference}
 */
export const constructInternalReference = (
  region,
  oracles,
  target,
  args,
  new_target,
) => {
  const {
    global: {
      Reflect: { construct },
    },
  } = region;
  if (isGuestInternalReference(region, target)) {
    const external = leavePlainExternalReference(region, target);
    const { construct: oracle } = getMap(oracles, external) ?? MISSING_ORACLE;
    if (oracle) {
      return oracle(region, oracles, args, new_target);
    } else {
      return enterReference(
        region,
        construct(
          external,
          map(args, (arg) => leaveValue(region, arg)),
          leaveReference(region, new_target),
        ),
      );
    }
  } else {
    return construct(target, args, new_target);
  }
};
