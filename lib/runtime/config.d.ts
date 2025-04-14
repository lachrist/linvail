import type {
  Primitive,
  GuestReference,
  GuestReferenceKind,
  GuestReferenceWrapper,
  HostReference,
  HostReferenceKind,
  IncompleteHostReferenceWrapper,
  Wrapper,
  PrimitiveWrapper,
} from "./domain.d.ts";
import type { ApplyOracle, ConstructOracle } from "./oracle.js";

export type Config = {
  wrapGuestReference: <K extends GuestReferenceKind>(
    guest: GuestReference<K>,
    kind: K,
    apply: null | ApplyOracle,
    construct: null | ConstructOracle,
  ) => GuestReferenceWrapper<K>;
  wrapHostReference: <K extends HostReferenceKind>(
    host: HostReference<K>,
    kind: K,
  ) => IncompleteHostReferenceWrapper<K>;
  wrapPrimitive: (primitive: Primitive) => PrimitiveWrapper;
  dir: (value: Wrapper) => void;
};
