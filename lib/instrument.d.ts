import type { Atom, Program, StandardAspectKind } from "aran";

/**
 * The advice created by `createCustomAdvice` instrumentation of Aran programs
 * via this function to implement Linvail's membrane.
 */
export const weave: <atom extends Atom>(
  root: Program<atom>,
  config: { advice_global_variable: string },
) => Program<atom>;

/**
 * The advice created by `createStandardAdvice` requires this pointcut to be
 * provided to `aran.weaveStandard` in order to implement Linvail's membrane.
 */
export const standard_pointcut: StandardAspectKind[];
