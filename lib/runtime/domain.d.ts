import type { ClosureKind } from "aran";

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
  __brand: "PrimitiveWrapper";
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
    __brand: "HostReferenceWrapper";
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
    __brand: "GuestReferenceWrapper";
    type: "guest";
    kind: K;
    inner: GuestReference<K>;
    name: null | string;
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

export type DefineDescriptor<D, A> = {
  __proto__?: null;
  value?: D;
  writable?: boolean;
  get?: A | undefined;
  set?: A | undefined;
  configurable?: boolean;
  enumerable?: boolean;
};

export type DataDescriptor<D> = {
  value: D;
  configurable: boolean;
  writable: boolean;
  enumerable: boolean;
};

export type AccessorDescriptor<A> = {
  get: A | undefined;
  set: A | undefined;
  configurable: boolean;
  enumerable: boolean;
};

export type Descriptor<D, A> = DataDescriptor<D> | AccessorDescriptor<A>;

export type NonLengthPropertyKey = PropertyKey & {
  __brand: "NonLengthPropertyKey";
};

export type HostDescriptor = Descriptor<Wrapper, Reference>;

export type GuestDescriptor = Descriptor<Value, Reference>;

export type HostDefineDescriptor = DefineDescriptor<Wrapper, Value>;

export type GuestDefineDescriptor = DefineDescriptor<Value, Value>;
