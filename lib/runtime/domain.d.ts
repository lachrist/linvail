import type { ClosureKind } from "aran";
import type { ApplyOracle, ConstructOracle } from "./oracle.d.ts";

//////////////
// External //
//////////////

export type StandardPrimitive =
  | null
  | undefined
  | string
  | number
  | boolean
  | bigint;

export type Primitive = StandardPrimitive | symbol;

export type GuestReferenceKind = "array" | "object" | "function";

type GuestReferenceTyping = {
  [K in GuestReferenceKind]: {
    __brand: "GuestReference";
    __kind: K;
  };
};

export type GuestReference<K extends GuestReferenceKind = GuestReferenceKind> =
  GuestReferenceTyping[K];

export type ProxyReference = {
  __brand: "ProxyReference";
};

export type Reference = GuestReference | ProxyReference;

export type Value = Primitive | Reference;

//////////////
// Internal //
//////////////

export type PrimitiveWrapper = {
  type: "primitive";
  inner: Primitive;
};

export type HostReferenceKind = "object" | "array" | ClosureKind;

type HostReferenceTyping = {
  [K in HostReferenceKind]: {
    __brand: "HostReference";
    __kind: K;
  };
};

export type HostReference<K extends HostReferenceKind = HostReferenceKind> =
  HostReferenceTyping[K];

type HostReferenceWrapperTyping<Complete extends boolean> = {
  [K in HostReferenceKind]: {
    type: "host";
    kind: K;
    inner: Complete extends true ? ProxyReference : null;
    plain: HostReference<K>;
  };
};

export type HostReferenceWrapper<
  K extends HostReferenceKind = HostReferenceKind,
> = HostReferenceWrapperTyping<true>[K];

export type IncompleteHostReferenceWrapper<
  K extends HostReferenceKind = HostReferenceKind,
> = HostReferenceWrapperTyping<false>[K];

type GuestReferenceWrapperTyping = {
  [K in GuestReferenceKind]: {
    type: "guest";
    kind: K;
    inner: GuestReference<K>;
    apply: null | ApplyOracle;
    construct: null | ConstructOracle;
  };
};

export type GuestReferenceWrapper<
  K extends GuestReferenceKind = GuestReferenceKind,
> = GuestReferenceWrapperTyping[K];

export type ReferenceWrapper = HostReferenceWrapper | GuestReferenceWrapper;

export type Wrapper = PrimitiveWrapper | ReferenceWrapper;

/////////////
// Bastard //
/////////////

export type FreshHostClosure = {
  __brand: "FeshHostClosure";
};

export type FreshHostGeneratorResult = {
  __brand: "FreshHostGeneratorResult";
};

//////////////
// Property //
//////////////

export type DefineDescriptor<D> = {
  __proto__?: null;
  value?: D;
  writable?: Value;
  get?: Value;
  set?: Value;
  configurable?: Value;
  enumerable?: Value;
};

export type DataDescriptor<D> = {
  value: D;
  configurable: boolean;
  writable: boolean;
  enumerable: boolean;
};

export type AccessorDescriptor = {
  get: Reference | undefined;
  set: Reference | undefined;
  configurable: boolean;
  enumerable: boolean;
};

export type Descriptor<D> = DataDescriptor<D> | AccessorDescriptor;

export type NonLengthPropertyKey = PropertyKey & {
  __brand: "NonLengthPropertyKey";
};

export type HostDescriptor = Descriptor<Wrapper>;

export type GuestDescriptor = Descriptor<Value>;

export type HostDefineDescriptor = DefineDescriptor<Wrapper>;

export type GuestDefineDescriptor = DefineDescriptor<Value>;
