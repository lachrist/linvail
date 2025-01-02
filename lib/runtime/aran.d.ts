import type {
  ExternalPrototype,
  ExternalReference,
  ExternalValue,
  GenericPlainInternalReference,
  InternalPrototype,
  InternalReference,
  InternalValue,
} from "./domain";

export type AranLibrary = {
  sliceObject: {
    (
      target: InternalValue,
      exclusion: InternalValue,
    ): GenericPlainInternalReference & {
      __type: "Object";
      __prototype: "External";
    };
    (target: ExternalValue, exclusion: ExternalValue): ExternalReference;
  };
  listForInKey: {
    (target: ExternalValue): string[];
    (target: InternalValue): string[];
  };
  get: {
    (target: ExternalValue, key: ExternalValue): ExternalValue;
  };
  createObject: {
    (
      prototype: ExternalPrototype,
      ...properties: ExternalValue[]
    ): ExternalReference;
    (
      prototype: InternalPrototype,
      ...properties: (InternalValue | ExternalValue)[]
    ): InternalReference;
  };
};
