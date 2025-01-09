import type { ClosureKind } from "../../instrument/type";
import type {
  GuestExternalReference,
  GuestInternalReference,
  InternalPrimitive,
  PlainInternalClosure,
  PlainInternalReference,
} from "../domain";
import type { Global } from "../global";
import type { WeakSet, WeakMap, Set } from "../../util/collection";
import type { Naming } from "../naming";

type Listener<E> = (event: E) => void;

type ListenerRegistery<E> = Set<Listener<E>>;

export type Region = {
  global: Global;
  naming: Naming;
  listeners: {
    active: boolean;
    capture: null | ListenerRegistery<InternalPrimitive>;
    release: null | ListenerRegistery<InternalPrimitive>;
  };
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
};
