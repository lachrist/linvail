import type { Advice } from "../advice.d.ts";

export type Convertion = Exclude<
  keyof Advice,
  "apply" | "construct" | "enterClosure"
>;
