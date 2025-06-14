import type { Program } from "aran";

export type AdviceConfig = {
  weaveEvalProgram: (program: Program) => Program;
};

export type PartialAdviceConfig = null | undefined | Partial<AdviceConfig>;
