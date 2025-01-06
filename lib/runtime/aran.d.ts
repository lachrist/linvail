import type {
  ExternalPrototype,
  ExternalReference,
  ExternalValue,
  InternalPrototype,
  InternalReference,
  InternalValue,
  PlainInternalObjectWithExternalPrototype,
} from "./domain";

export type AranLibrary = {
  sliceObject: {
    (
      target: InternalValue,
      exclusion: InternalValue,
    ): PlainInternalObjectWithExternalPrototype;
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
