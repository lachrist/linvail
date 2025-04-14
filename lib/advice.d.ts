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
  // wrap //
  wrap: (value: Value) => Wrapper;
  wrapStandardPrimitive: (primitive: StandardPrimitive) => PrimitiveWrapper;
  wrapSymbolPrimitive: (symbol: symbol) => PrimitiveWrapper;
  wrapReference: (reference: Reference) => ReferenceWrapper;
  wrapFreshHostArray: (reference: HostReference) => ReferenceWrapper;
  wrapHostClosure: <K extends ClosureKind>(
    closure: HostReference<K>,
  ) => HostReferenceWrapper<K>;
  wrapFreshHostClosure: <K extends ClosureKind>(
    closure: FreshHostClosure,
    kind: K,
  ) => HostReferenceWrapper<K>;
  // combine //
  apply: (callee: Wrapper, that: Wrapper, args: Wrapper[]) => Wrapper;
  construct: (callee: Wrapper, args: Wrapper[]) => ReferenceWrapper;
  // other //
  toHostReferenceWrapper: (
    reference: GuestReference,
    config: {
      prototype: "none" | "copy" | "Object.prototype";
    },
  ) => HostReferenceWrapper;
  weaveEvalProgram: (root: Program<any>) => Program;
};
