import type { Cage } from "./cage";
import type {
  ExternalReference,
  GuestExternalReference,
  GuestInternalReference,
  InternalReference,
  PlainExternalReference,
  PlainInternalReference,
} from "./domain";

export type Region<X> = Cage<X> & {
  isGuestInternalReference: (
    reference: InternalReference<X>,
  ) => reference is GuestInternalReference;
  toPlainExternalReference: (
    reference: GuestInternalReference,
  ) => PlainExternalReference;
  toGuestInternalReference: (
    reference: PlainExternalReference,
  ) => GuestInternalReference;
  isGuestExternalReference: (
    reference: ExternalReference,
  ) => reference is GuestExternalReference;
  toPlainInternalReference: (
    reference: GuestExternalReference,
  ) => PlainInternalReference<X>;
  toGuestExternalReference: (
    reference: PlainInternalReference<X>,
  ) => GuestExternalReference;
};
