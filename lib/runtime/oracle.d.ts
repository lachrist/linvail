import type { ReferenceWrapper, Wrapper } from "./domain.d.ts";
import type { Region } from "./region.d.ts";

export type ApplyOracle = (
  region: Region,
  that: Wrapper,
  args: Wrapper[],
) => Wrapper;

export type ConstructOracle = (
  region: Region,
  args: Wrapper[],
  new_target: ReferenceWrapper,
) => ReferenceWrapper;

export type Oracle = {
  apply: null | ApplyOracle;
  construct: null | ConstructOracle;
};
