import { visitProgram } from "./instrument/visit.mjs";
import { listKey } from "./util/record.mjs";

/**
 * @type {<atom extends import("aran").Atom>(
 *   root: import("aran").Program<atom>,
 *   config: {
 *     advice_global_variable: string,
 *   },
 * ) => import("aran").Program<atom>}
 */
export const weave = (root, { advice_global_variable }) =>
  /** @type {import("aran").Program<any>} */ (
    visitProgram(
      /** @type {import("aran").Program<any>} */ (root),
      advice_global_variable,
    )
  );

/**
 * @type {{
 *   [k in import("./runtime/advice/standard.js").StandardAspectKind]: null
 * }}
 */
const standard_pointcut_record = {
  "block@declaration-overwrite": null,
  "closure-block@after": null,
  "program-block@after": null,
  "primitive@after": null,
  "intrinsic@after": null,
  "closure@after": null,
  "export@before": null,
  "import@after": null,
  "test@before": null,
  "eval@before": null,
  "await@before": null,
  "await@after": null,
  "yield@before": null,
  "yield@after": null,
  "apply@around": null,
  "construct@around": null,
};

export const standard_pointcut = listKey(standard_pointcut_record);
