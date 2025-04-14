import type { IntrinsicRecord } from "aran";
import type {
  StandardAdvice,
  StandardAspectKind,
} from "./runtime/standard.d.ts";
import type { Advice } from "./advice.d.ts";
import type { Library } from "./library/library.d.ts";
import type {
  GuestReferenceKind,
  GuestReferenceWrapper,
  HostReferenceKind,
  HostReferenceWrapper,
  Primitive,
  PrimitiveWrapper,
  Wrapper,
} from "./runtime/domain.d.ts";

export const toStandardAdvice: <T>(advice: Advice) => StandardAdvice<T>;

// export type PrimitiveWrapper = {
//   type: "primitive";
//   inner: Primitive;
// };

// export type GuestReferenceWrapper = {
//   type: "guest";
//   kind: GuestReferenceKind;
//   inner: object;
//   name: null | string;
// };

// export type HostReferenceWrapper = {
//   type: "host";
//   kind: HostReferenceKind;
//   inner: object;
//   plain: object;
// };

// export type Config<
//   P extends PrimitiveWrapper,
//   G extends GuestReferenceWrapper,
//   H extends HostReferenceWrapper,
// > = {
//   dir: (value: P | G | H) => void;
//   wrapPrimitive: (primitive: Primitive) => P;
//   wrapGuestReference: (
//     reference: object,
//     kind: GuestReferenceKind,
//     name: null | string,
//   ) => G;
//   wrapHostReference: (reference: object, kind: HostReferenceKind) => H;
// };

export type Config = {
  dir: (value: Wrapper) => void;
  wrapPrimitive: (primitive: Primitive) => PrimitiveWrapper;
  wrapGuestReference: (
    reference: object,
    kind: GuestReferenceKind,
    name: null | string,
  ) => GuestReferenceWrapper;
  wrapHostReference: (
    reference: object,
    kind: HostReferenceKind,
  ) => HostReferenceWrapper;
};

export const createRuntime: (
  intrinsics: IntrinsicRecord,
  config: Config,
) => {
  library: Library;
  advice: Advice;
};

export const setupRuntime: (
  intrinsics: IntrinsicRecord,
  config: {
    dir: (value: unknown) => void;
    count: boolean;
  },
) => Advice;

export const standard_pointcut: StandardAspectKind[];
