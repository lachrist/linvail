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

export type Reflect = {
  has: (target: InternalReference, key: PropertyKey) => boolean;
  get: (
    target: InternalReference,
    key: PropertyKey,
    receiver: InternalValue,
  ) => InternalValue;
  set: (
    target: InternalReference,
    key: PropertyKey,
    value: InternalValue,
    receiver: InternalValue,
  ) => boolean;
  apply: (
    target: InternalValue,
    that: InternalValue,
    args: InternalValue[],
  ) => InternalValue;
  construct: (
    target: InternalReference,
    args: InternalValue[],
    new_target: InternalReference,
  ) => InternalReference;
};

export type Context = Config & { reflect: Reflect };

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
