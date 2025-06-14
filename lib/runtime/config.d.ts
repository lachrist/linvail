import type {
  Primitive,
  GuestReference,
  GuestReferenceWrapper,
  HostReference,
  HostReferenceKind,
  IncompleteHostReferenceWrapper,
  Wrapper,
  PrimitiveWrapper,
} from "./domain.d.ts";

export type RegionConfig = {
  wrapGuestReference: (
    guest: GuestReference,
    name: null | string,
  ) => GuestReferenceWrapper;
  wrapHostReference: (
    host: HostReference<any>,
    kind: HostReferenceKind,
  ) => IncompleteHostReferenceWrapper;
  wrapPrimitive: (primitive: Primitive) => PrimitiveWrapper;
  dir: (value: Wrapper) => void;
  warn: (message: string) => void;
};

export type PartialRegionConfig = null | undefined | Partial<RegionConfig>;
