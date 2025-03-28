import type { ClosureKind } from "aran";
import type {
  ExternalValue,
  GuestExternalReference,
  GuestInternalReference,
  InternalPrimitive,
  InternalValue,
  PlainExternalReference,
  PlainInternalClosure,
  PlainInternalReference,
} from "../domain";
import type { IntrinsicRecord } from "../intrinsic";
import type { WeakSet, WeakMap, Map, Set } from "../../util/collection";

export type Region = IntrinsicRecord & {
  counter: null | { value: number };
  naming: Map<ExternalValue, string>;
  createIntegrityFunction: () => Function;
  createIntegrityArrow: () => Function;
  generator_prototype_prototype: PlainExternalReference;
  async_generator_prototype_prototype: PlainExternalReference;
  listening: {
    active: boolean;
    capture: null | Map<symbol, (primitive: InternalValue) => void>;
    release: null | Map<symbol, (primitive: InternalValue) => void>;
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
  map_registery: WeakMap<InternalValue, Map<InternalValue, InternalValue>>;
  set_registery: WeakMap<InternalValue, Set<InternalValue>>;
  weak_map_registery: WeakMap<
    InternalValue,
    WeakMap<InternalValue, InternalValue>
  >;
  weak_set_registery: WeakMap<InternalValue, WeakSet<InternalValue>>;
  dir: (value: InternalValue) => void;
};
