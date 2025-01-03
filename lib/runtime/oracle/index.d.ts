import type { AranLibrary } from "../aran";
import type { InternalReference, InternalValue } from "../domain";
import type { Linvail } from "../library";
import type { Region } from "../region";
import type { Global } from "../global";
import type { Convert } from "./convert";
import type { Reflect } from "./reflect";

export type Config = {
  region: Region;
  aran: AranLibrary;
  linvail: Linvail;
  global: Global;
};

export type Context = Config & { reflect: Reflect; convert: Convert };

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
