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

export type Config = {
  wrapGuestReference: <K extends GuestReferenceKind>(
    guest: GuestReference<K>,
    kind: K,
    name: null | string,
  ) => GuestReferenceWrapper<K>;
  wrapHostReference: <K extends HostReferenceKind>(
    host: HostReference<K>,
    kind: K,
  ) => IncompleteHostReferenceWrapper<K>;
  wrapPrimitive: (primitive: Primitive) => PrimitiveWrapper;
  dir: (value: Wrapper) => void;
};
