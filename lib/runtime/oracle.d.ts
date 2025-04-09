import type { InternalReference, InternalValue } from "./domain.d.ts";
import type { Region } from "./region/region.d.ts";

export type ApplyOracle = (
  region: Region,
  that: InternalValue,
  args: InternalValue[],
) => InternalValue;

export type ConstructOracle = (
  region: Region,
  args: InternalValue[],
  new_target: InternalReference,
) => InternalReference;

export type ApplyOracleMapping<K extends string> = {
  [k in K]: null | ApplyOracle;
};

export type ConstructOracleMapping<K extends string> = {
  [k in K]: null | ConstructOracle;
};
