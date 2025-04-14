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
import type { ApplyOracle, ConstructOracle } from "./oracle.d.ts";

export type Config = {
  wrapGuestReference: (
    guest: GuestReference<any>,
    kind: GuestReferenceKind,
    apply: null | ApplyOracle,
    construct: null | ConstructOracle,
  ) => GuestReferenceWrapper;
  wrapHostReference: (
    host: HostReference<any>,
    kind: HostReferenceKind,
  ) => IncompleteHostReferenceWrapper;
  wrapPrimitive: (primitive: Primitive) => PrimitiveWrapper;
  dir: (value: Wrapper) => void;
};
