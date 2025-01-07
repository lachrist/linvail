import type {
  DefineDescriptor,
  ExternalValue,
  InternalPrototype,
  InternalReference,
  InternalValue,
  PlainInternalArray,
  PlainInternalArrayWithExternalPrototype,
  PlainInternalObject,
  PlainInternalObjectWithExternalPrototype,
} from "../domain";
import type { Region } from "../region/region";
import type { Global } from "../global";
import type { Reflect } from "./reflect";
import type { Primitive } from "../../primitive";

export type Config = {
  global: Global;
  reflect: Reflect;
  region: Region;
};

export type Convert = {
  atInternal: (array: InternalValue[], index: number) => InternalValue;
  atExternal: (array: InternalValue[], index: number) => ExternalValue;
  fromPrimitiveArray: (array: Primitive[]) => PlainInternalArray;
  toStrictTarget: (value: InternalValue) => InternalReference;
  toSloppyTarget: (value: InternalValue) => InternalReference;
  internalizeArrayPrototype: (
    value: PlainInternalArrayWithExternalPrototype,
  ) => PlainInternalArray;
  internalizeObjectPrototype: (
    value: PlainInternalObjectWithExternalPrototype,
  ) => PlainInternalObject;
  fromInternalPrototype: (prototype: InternalPrototype) => InternalValue;
  toInternalPrototype: (value: InternalValue) => InternalPrototype;
  toInternalDefineDescriptor: (
    value: InternalValue,
  ) => DefineDescriptor<InternalValue, InternalReference>;
};
