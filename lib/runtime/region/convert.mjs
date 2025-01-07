import { LinvailExecError } from "../../error.mjs";
import { enterPrototype } from "./util.mjs";

/**
 * @type {(
 *   region: import(".").Region,
 *   array: import("../domain").PlainInternalArrayWithExternalPrototype,
 * ) => import("../domain").PlainInternalArray}
 */
export const fromPlainInternalArrayWithExternalPrototype = (region, array) => {
  const {
    global: {
      Reflect: { setPrototypeOf, getPrototypeOf },
    },
  } = region;
  if (!setPrototypeOf(array, enterPrototype(region, getPrototypeOf(array)))) {
    throw new LinvailExecError("Cannot internalize prototype of array", {
      array,
      region,
    });
  }
  return /** @type {any} */ (array);
};
