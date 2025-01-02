import type { AranLibrary } from "../aran";
import type { InternalReference, InternalValue } from "../domain";
import type { Linvail } from "../library";
import type { Region } from "../region";
import type { Global } from "../global";

export type Config = {
  region: Region;
  aran: AranLibrary;
  linvail: Linvail;
  global: Global;
};

export type Call = {
  apply: (
    target: InternalValue,
    that: InternalValue,
    args: InternalValue[],
  ) => InternalValue;
  construct: (
    target: InternalValue,
    args: InternalValue[],
    new_target: InternalValue,
  ) => InternalReference;
};

export type Context = Config & Call;

export type Oracle = {
  apply: null | ((that: InternalValue, args: InternalValue[]) => InternalValue);
  construct:
    | null
    | ((
        args: InternalValue[],
        new_target: InternalReference,
      ) => InternalReference);
};

export type OracleEntry = [Function, Oracle];

export type CompileOracleEntry = (context: Context) => OracleEntry;
