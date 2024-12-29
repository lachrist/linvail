import type { Cage } from "./cage";
import type {
  ExternalReference,
  ExtrinsicExternalReference,
  ExtrinsicInternalReference,
  InternalReference,
  IntrinsicExternalReference,
  IntrinsicInternalReference,
} from "./domain";

export type Region<X> = Cage<X> & {
  isIntrinsicInternalReference: (
    reference: InternalReference<X>,
  ) => reference is IntrinsicInternalReference<X>;
  infiltrateExternalReference: (
    value: IntrinsicExternalReference,
  ) => ExtrinsicInternalReference;
  exfiltrateExternalReference: (
    value: ExtrinsicInternalReference,
  ) => IntrinsicExternalReference;
  isExtrinsicExternalReference: (
    value: ExternalReference,
  ) => value is ExtrinsicExternalReference;
  infiltrateInternalReference: (
    value: ExtrinsicExternalReference,
  ) => IntrinsicInternalReference<X>;
  exfiltrateInternalReference: (
    value: IntrinsicInternalReference<X>,
  ) => ExtrinsicExternalReference;
};
