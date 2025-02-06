import { visitProgram } from "./visit.mjs";

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
