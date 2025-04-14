import type {
  ProxyReference,
  Wrapper,
  GuestReference,
  ReferenceWrapper,
  HostReference,
  HostReferenceWrapper,
  Value,
  PrimitiveWrapper,
} from "./domain.d.ts";
import type { IntrinsicRecord } from "./intrinsic.d.ts";
import type {
  SafeWeakMap,
  SafeMap,
  SafeWeakSet,
  SafeSet,
} from "../util/collection.d.ts";
import type { ClosureKind } from "aran";
import type { Config } from "./config.d.ts";

export type Region = IntrinsicRecord &
  Config & {
    createIntegrityFunction: () => Function;
    createIntegrityArrow: () => Function;
    generator_prototype_prototype: GuestReference;
    async_generator_prototype_prototype: GuestReference;
    naming: SafeMap<Value, string>;
    reference_registery: SafeWeakMap<
      GuestReference | ProxyReference,
      ReferenceWrapper
    >;
    host_closure_registery: SafeWeakMap<
      HostReference<ClosureKind>,
      HostReferenceWrapper<ClosureKind>
    >;
    symbol_registery: SafeWeakMap<symbol, PrimitiveWrapper>;
    shared_symbol_registery: SafeMap<string, PrimitiveWrapper>;
    map_registery: SafeWeakMap<Wrapper, SafeMap<Wrapper, Wrapper>>;
    set_registery: SafeWeakMap<Wrapper, SafeSet<Wrapper>>;
    weak_map_registery: SafeWeakMap<Wrapper, SafeWeakMap<Wrapper, Wrapper>>;
    weak_set_registery: SafeWeakMap<Wrapper, SafeWeakSet<Wrapper>>;
  };
