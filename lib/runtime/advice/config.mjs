import { LinvailExecError } from "../../error.mjs";

/**
 * @type {(
 *   config: import("./config.d.ts").PartialAdviceConfig,
 * ) => import("./config.d.ts").AdviceConfig}
 */
export const completeAdviceConfig = (config) => ({
  ...config,
  weaveEvalProgram: (_root) => {
    throw new LinvailExecError(
      "Support for direct eval call requires to configure weaveEvalProgram.",
    );
  },
});
