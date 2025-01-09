import type { InternalReference, InternalValue } from "./domain";
import type { Region } from "./region/region";
import type { Name } from "./naming";

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

export type ApplyOracleMapping = {
  [key in Name | "__proto__"]?: key extends "__proto__" ? null : ApplyOracle;
};

export type ConstructOracleMapping = {
  [key in Name | "__proto__"]?: key extends "__proto__"
    ? null
    : ConstructOracle;
};
