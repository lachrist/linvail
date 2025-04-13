import type {
  Value,
  Wrapper,
  GuestReference,
  FreshHostClosure,
  HostReference,
  PrimitiveWrapper,
  ReferenceWrapper,
  Reference,
  HostReferenceWrapper,
  StandardPrimitive,
} from "./runtime/domain.d.ts";
import type { Program, ClosureKind } from "aran";

export type Advice = {
  // event //
  addEventListener: (
    event: "capture" | "release",
    listener: (value: Wrapper) => void,
  ) => symbol;
  removeEventListener: (event: "capture" | "release", token: symbol) => boolean;
  // leave //
  leaveValue: <W extends Wrapper>(value: W) => W["base"];
  // enter //
  enterValue: (value: Value) => Wrapper;
  enterStandardPrimitive: (primitive: StandardPrimitive) => PrimitiveWrapper;
  enterSymbolPrimitive: (symbol: symbol) => PrimitiveWrapper;
  enterReference: (reference: Reference) => ReferenceWrapper;
  enterFreshHostArray: (reference: HostReference) => ReferenceWrapper;
  enterHostClosure: <K extends ClosureKind>(
    closure: HostReference<K>,
  ) => HostReferenceWrapper<K>;
  enterFreshHostClosure: <K extends ClosureKind>(
    closure: FreshHostClosure,
    kind: K,
  ) => HostReferenceWrapper<K>;
  // combine //
  apply: (callee: Wrapper, that: Wrapper, args: Wrapper[]) => Wrapper;
  construct: (callee: Wrapper, args: Wrapper[]) => ReferenceWrapper;
  // other //
  internalize: (
    reference: GuestReference,
    config: {
      prototype: "none" | "copy" | "Object.prototype";
    },
  ) => HostReferenceWrapper;
  weaveEvalProgram: (root: Program<any>) => Program;
};

// leavePlainInternalReference: (reference: HostReference) => ProxyReference;
// enterPlainExternalReference: (
//   reference: GuestReference,
// ) => GuestInternalReference;
// isGuestInternalReference: (value: Wrapper) => value is GuestInternalReference;
// isPlainInternalReference: (value: Wrapper) => value is HostReference;
// isInternalPrimitive: (value: Wrapper) => value is InternalPrimitive;
// leavePrimitive: (wrapper: PrimitiveWrapper) => Primitive;
// leaveBoolean: (value: Wrapper) => boolean;
