import type { Atom, Program } from "aran";

export const weave: <atom extends Atom>(
  root: Program<atom>,
  config: { advice_global_variable: string },
) => Program<atom>;
