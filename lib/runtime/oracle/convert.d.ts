import type { DefineDescriptor } from "../descriptor";
import type {
  ExternalValue,
  GenericPlainInternalReference,
  InternalPrototype,
  InternalReference,
  InternalValue,
} from "../domain";
import type { Region } from "../region";
import type { Global } from "../global";
import type { Reflect } from "./reflect";

export type Config = {
  global: Global;
  reflect: Reflect;
  region: Region;
};

export type Convert = {
  atInternal: (array: InternalValue[], index: number) => InternalValue;
  atExternal: (array: InternalValue[], index: number) => ExternalValue;
  toTarget: (value: InternalValue) => InternalReference;
  harmonizePrototype: (
    target: GenericPlainInternalReference & { __prototype: "External" },
  ) => GenericPlainInternalReference & { __prototype: "Internal" };
  fromInternalPrototype: (prototype: InternalPrototype) => InternalValue;
  toInternalPrototype: (value: InternalValue) => InternalPrototype;
  toInternalDefineDescriptor: (
    value: InternalValue,
  ) => DefineDescriptor<InternalValue, InternalReference>;
};
