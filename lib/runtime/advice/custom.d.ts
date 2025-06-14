import type {
  Value,
  Wrapper,
  FreshHostClosure,
  HostReference,
  PrimitiveWrapper,
  ReferenceWrapper,
  Reference,
  HostReferenceWrapper,
  StandardPrimitive,
} from "../domain.js";
import type { Program, ClosureKind } from "aran";

export type CustomAdvice = {
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
  // eval //
  weaveEvalProgram: (root: Program<any>) => Program;
};
