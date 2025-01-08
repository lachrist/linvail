import type {
  InternalReference,
  InternalValue,
  PlainExternalReference,
} from "../domain";
import type { Region } from "../region";
import type { Map } from "../../collection";

export type Oracle = {
  apply:
    | null
    | ((
        region: Region,
        registery: OracleRegistery,
        that: InternalValue,
        args: InternalValue[],
      ) => InternalValue);
  construct:
    | null
    | ((
        region: Region,
        registery: OracleRegistery,
        args: InternalValue[],
        new_target: InternalReference,
      ) => InternalReference);
};

export type OracleEntry = [string, Oracle];

export type OracleRegistery = Map<PlainExternalReference, Oracle>;

export type OracleMapping = {
  [key in string]: Oracle;
};

export type DeepExternalReference = PlainExternalReference & {
  [key in string]: DeepExternalReference;
};
