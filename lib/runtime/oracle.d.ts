import type { ReferenceWrapper, Wrapper } from "./domain.d.ts";
import type { Region } from "./region/region.d.ts";

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

export type ApplyOracleMapping<K extends string> = {
  [k in K]: null | ApplyOracle;
};

export type ConstructOracleMapping<K extends string> = {
  [k in K]: null | ConstructOracle;
};
