import type {
  Primitive,
  Reference,
  Value,
  ProxyReference,
  HostReferenceWrapper,
  Wrapper,
  NonLengthPropertyKey,
  GuestReference,
  FreshHostClosure,
  HostReferenceKind,
  FreshHostGeneratorResult,
  HostReference,
  GuestDefineDescriptor,
  HostDefineDescriptor,
  GuestDescriptor,
  HostDescriptor,
  DataDescriptor,
} from "./domain.d.ts";

export type IntrinsicRecord = {
  // Other //
  "global.isNaN": (value: Value) => boolean;
  "global.Proxy": new (target: any, handler: any) => ProxyReference;
  "global.String": {
    (value: Value): string;
    new (value: Value): GuestReference;
  };
  "global.Error": new (message: string) => Error;
  "global.TypeError": new (message: string) => Error;
  "global.RangeError": new (message: string) => Error;
  "global.undefined": undefined;
  "global.eval": (code: string) => any;
  // Function //
  "global.Function": new (...source: string[]) => Function;
  "global.Function.prototype": GuestReference;
  "global.Function.prototype.arguments@get": GuestReference;
  "global.Function.prototype.arguments@set": GuestReference;
  // Number //
  "global.Number": {
    (value: Value): number;
    new (value: Value): GuestReference;
  };
  "global.Number.MAX_SAFE_INTEGER": number;
  "global.Number.MIN_SAFE_INTEGER": number;
  // Symbol //
  "global.Symbol.keyFor": (symbol: symbol) => string | undefined;
  "global.Symbol.iterator": symbol;
  "global.Symbol.species": symbol;
  "global.Symbol.isConcatSpreadable": symbol;
  "global.Symbol.toStringTag": symbol;
  // Reflect //
  "global.Reflect.apply": {
    (
      target: HostReference<"arrow" | "method" | "function">,
      that: Wrapper,
      args: Wrapper[],
    ): Wrapper;
    (
      target: HostReference<"async-arrow" | "async-method" | "async-function">,
      that: Wrapper,
      args: Wrapper[],
    ): GuestReference;
    (
      target: HostReference<"generator" | "async-generator">,
      that: Wrapper,
      args: Wrapper[],
    ): FreshHostGeneratorResult;
    (target: GuestReference, that: Value, args: Value[]): Value;
    <T, Y>(target: () => Y, that: T, args: []): Y;
    <T, X, Y>(target: (...args: X[]) => Y, that: T, args: X[]): Y;
  };
  "global.Reflect.construct": {
    (target: Primitive, args: unknown, new_target: unknown): never;
    (target: GuestReference, args: Value[], new_target: Value): Reference;
    (
      target: HostReference,
      args: Wrapper[],
      new_target: Value,
    ): HostReferenceWrapper;
  };
  "global.Reflect.preventExtensions": {
    (target: Primitive): never;
    (target: GuestReference): boolean;
    (target: HostReference): boolean;
  };
  "global.Reflect.isExtensible": {
    (target: Primitive): never;
    (target: GuestReference): boolean;
    (target: HostReference): boolean;
  };
  "global.Reflect.getPrototypeOf": {
    (target: Primitive): never;
    (target: GuestReference | HostReference): null | Reference;
    (target: FreshHostGeneratorResult): Wrapper;
  };
  "global.Reflect.setPrototypeOf": {
    (target: Primitive, prototype: unknown): never;
    (
      target: GuestReference | HostReference,
      prototype: null | Reference,
    ): boolean;
  };
  "global.Reflect.ownKeys": {
    (target: Primitive): never;
    (target: GuestReference): (string | symbol)[];
    (target: HostReference): (string | symbol)[];
  };
  "global.Reflect.deleteProperty": {
    (target: Primitive, key: unknown): never;
    (target: GuestReference, key: Value): boolean;
    (target: HostReference, key: Value): boolean;
  };
  "global.Reflect.getOwnPropertyDescriptor": {
    (target: Primitive, key: unknown): never;
    (target: GuestReference, key: Value): GuestDescriptor | undefined;
    (
      target: HostReference<Exclude<HostReferenceKind, "array">>,
      key: Value,
    ): HostDescriptor | undefined;
    (
      target: HostReference<"array">,
      key: NonLengthPropertyKey,
    ): HostDescriptor | undefined;
    (target: HostReference<"array">, key: "length"): DataDescriptor<number>;
    (
      target: FreshHostClosure,
      key: "prototype" | "name" | "length",
    ): DataDescriptor<GuestReference>;
  };
  "global.Reflect.defineProperty": {
    (target: Primitive, key: unknown, descriptor: unknown): never;
    (
      target: GuestReference,
      key: Value,
      descriptor: GuestDefineDescriptor,
    ): boolean;
    (
      target: HostReference<Exclude<HostReferenceKind, "array">>,
      key: Value,
      descriptor: HostDefineDescriptor,
    ): boolean;
    (
      target: HostReference<"array">,
      key: NonLengthPropertyKey,
      descriptor: HostDefineDescriptor,
    ): boolean;
    (
      target: HostReference<"array">,
      key: number | symbol,
      descriptor: HostDefineDescriptor,
    ): boolean;
    (
      target: HostReference<"array">,
      key: "length",
      descriptor: GuestDefineDescriptor,
    ): boolean;
  };
  "global.Reflect.has": {
    (target: Primitive, key: unknown): never;
    (target: GuestReference, key: Value): boolean;
  };
  "global.Reflect.get": {
    (target: Value, key: Value, receiver: Value): Value;
    (target: HostReference<"array">, key: "length"): number;
  };
  "global.Reflect.set": {
    (target: Primitive, key: unknown, value: unknown, receiver: unknown): never;
    (
      target: GuestReference,
      key: Value,
      value: Value,
      receiver: Value,
    ): boolean;
  };
  // Object //
  "global.Object": GuestReference & {
    (): HostReference & {
      __type: "Object";
      __prototype: "External";
    };
    (value: Primitive | symbol): GuestReference;
  };
  "global.Object.create": {
    (prototype: null | Reference): HostReference<"object">;
  };
  "global.Object.hasOwn": {
    (target: GuestReference, key: Value): boolean;
    (target: HostReference, key: Value): boolean;
  };
  "global.Object.is": (value1: Value, value2: Value) => boolean;
  // Object.prototype //
  "global.Object.prototype": GuestReference;
  // Array //
  "global.Array": {
    new (length: number): HostReference<"array">;
    new (...elements: Wrapper[]): HostReference<"array">;
  };
  "global.Array.of": (...elements: Wrapper[]) => HostReference<"array">;
  "global.Array.isArray": {
    (value: HostReference): value is HostReference<"array">;
    (value: GuestReference): value is GuestReference<"array">;
  };
  // Array.prototype //
  "global.Array.prototype": GuestReference;
  "global.Array.prototype[@@iterator]": GuestReference;
};
