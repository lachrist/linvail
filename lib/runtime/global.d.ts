import type { Reflect } from "./reflect";
import type { DefineDescriptor } from "./descriptor";
import type {
  ExternalPrototype,
  ExternalValue,
  GenericPlainInternalReference,
  InternalPrototype,
  InternalReference,
  InternalValue,
  PlainExternalReference,
  PlainInternalReference,
} from "./domain";
import type { Primitive } from "../primitive";

export type Global = {
  Error: new (message: string) => Error;
  TypeError: new (message: string) => Error;
  undefined: undefined;
  Reflect: Reflect;
  Object: {
    (): PlainInternalReference & { __type: "Object"; __prototype: "External" };
    (value: Primitive): PlainExternalReference;
  } & {
    hasOwn: {
      (target: Primitive, key: unknown): never;
      (target: PlainExternalReference, key: ExternalValue): boolean;
      (target: PlainInternalReference, key: ExternalValue): boolean;
    };
    getPrototypeOf: {
      (target: Primitive): PlainExternalReference;
      (target: PlainExternalReference): ExternalPrototype;
      (
        target: GenericPlainInternalReference & { __prototype: "External" },
      ): ExternalPrototype;
      (
        target: GenericPlainInternalReference & { __prototype: "Internal" },
      ): InternalPrototype;
    };
    setPrototypeOf: {
      (target: unknown, prototype: unknown): never;
    };
    getOwnPropertyDescriptor: (target: unknown, key: unknown) => never;
    defineProperty: (
      target: unknown,
      key: unknown,
      descriptor: unknown,
    ) => never;
    create: {
      (
        prototype: InternalPrototype,
        descriptors: {
          [key in PropertyKey]: DefineDescriptor<
            InternalValue,
            InternalReference
          >;
        },
      ): InternalReference;
      (prototype: InternalPrototype): InternalReference;
    };
  };
  Array: {
    of: (...elements: InternalValue[]) => GenericPlainInternalReference & {
      __type: "Array";
      __prototype: "External";
    };
  };
};
