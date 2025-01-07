import type { ClosureKind } from "../../instrument";
import type {
  GuestExternalReference,
  GuestInternalReference,
  InternalPrimitive,
  PlainInternalClosure,
  PlainInternalReference,
} from "../domain";
import type { Global } from "../global";
import type { GuestExternalReferenceHandler } from "./proxy";

export type Region = {
  emitCapture: (primitive: InternalPrimitive) => void;
  emitRelease: (primitive: InternalPrimitive) => void;
  global: Global;
  guest_internal_reference_registery: WeakSet<GuestInternalReference>;
  internal_primitive_registery: WeakSet<InternalPrimitive>;
  plain_internal_closure_kind_mapping: WeakMap<
    PlainInternalClosure,
    ClosureKind
  >;
  plain_internal_reference_mapping: WeakMap<
    PlainInternalReference,
    GuestExternalReference
  >;
  guest_external_reference_mapping: WeakMap<
    GuestExternalReference,
    PlainInternalReference
  >;
  guest_external_reference_handler: GuestExternalReferenceHandler;
};
