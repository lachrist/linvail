import type {
  Wrapper,
  GuestReference,
  ReferenceWrapper,
  HostReference,
  HostReferenceWrapper,
  PrimitiveWrapper,
  Reference,
} from "./domain.d.ts";
import type { IntrinsicRecord } from "./intrinsic.d.ts";
import type {
  SafeWeakMap,
  SafeMap,
  SafeWeakSet,
  SafeSet,
} from "../util/collection.d.ts";
import type { ClosureKind } from "aran";
import type { RegionConfig } from "./config.d.ts";
import type { Oracle } from "./oracle.js";

export type Region = IntrinsicRecord &
  RegionConfig & {
    oracle: { [key in string]: Oracle };
    createIntegrityFunction: () => Function;
    createIntegrityArrow: () => Function;
    generator_prototype_prototype: GuestReference;
    async_generator_prototype_prototype: GuestReference;
    reference_registry: SafeWeakMap<Reference, ReferenceWrapper>;
    host_closure_registry: SafeWeakMap<
      HostReference<ClosureKind>,
      HostReferenceWrapper<ClosureKind>
    >;
    symbol_registry: SafeWeakMap<symbol, PrimitiveWrapper>;
    shared_symbol_registry: SafeMap<string, PrimitiveWrapper>;
    map_registry: SafeWeakMap<Wrapper, SafeMap<Wrapper, Wrapper>>;
    set_registry: SafeWeakMap<Wrapper, SafeSet<Wrapper>>;
    weak_map_registry: SafeWeakMap<Wrapper, SafeWeakMap<Wrapper, Wrapper>>;
    weak_set_registry: SafeWeakMap<Wrapper, SafeWeakSet<Wrapper>>;
  };
