import { ReferenceValue, Value } from "./membrane";
import { Descriptor } from "./reflect";
import { Primitive, Wrapper } from "./wrapper";

export type InternalDescriptor = Descriptor<InternalValue>;

export type InternalPrimitive = Wrapper;
export type ExternalPrimitive = Primitive;
export type InternalValue = Value<InternalPrimitive>;
export type ExternalValue = Value<ExternalPrimitive>;
export type InternalReference = ReferenceValue<InternalValue>;
export type ExternalReference = ReferenceValue<ExternalValue>;

export type InternalTarget = Primitive | InternalReference;

export type Membrane = {
  intrinsics: IntrinsicRecord;
  enterReference: (reference: ExternalReference) => InternalReference;
  leaveReference: (reference: InternalReference) => ExternalReference;
  enter: (value: ExternalValue) => InternalValue;
  leave: (value: InternalValue) => ExternalValue;
};

export type IntrinsicRecord = {
  // Object //
  "Object.create": (
    prototype: null | InternalReference,
    properties: { [key in PropertyKey]: InternalDescriptor },
  ) => InternalReference;
  "Object.assign": (...args: unknown[]) => unknown;
  "Object.keys": (...args: unknown[]) => unknown;
  "Object.defineProperty": (...args: unknown[]) => unknown;
  "Object.setPrototypeOf": (...args: unknown[]) => unknown;
  // Array //
  "Array.from": (...args: unknown[]) => unknown;
  "Array.of": (...elements: InternalValue[]) => InternalValue;
  "Array.prototype.flat": (this: unknown, ...args: unknown[]) => unknown;
  "Array.prototype.values": (this: unknown, ...args: unknown[]) => unknown;
  "Array.prototype.concat": (this: unknown, ...args: unknown[]) => unknown;
  "Array.prototype.slice": (this: unknown, ...args: unknown[]) => unknown;
  "Array.prototype.push": (this: unknown, ...args: unknown[]) => unknown;
  // Reflect //
  "Reflect.get": (
    target: null | InternalReference,
    key: ExternalValue,
    receiver: InternalValue,
  ) => InternalValue;
  "Reflect.has": (
    target: null | InternalReference,
    key: ExternalValue,
  ) => boolean;
  "Reflect.construct": (
    target: null | InternalReference,
    args: InternalValue[],
    new_target: null | InternalReference,
  ) => InternalValue;
  "Reflect.apply": (
    target: null | InternalReference,
    that: InternalValue,
    args: InternalValue[],
  ) => InternalValue;
  "Reflect.setProtoypeOf": (
    target: null | InternalReference,
    prototype: null | InternalReference,
  ) => boolean;
  "Reflect.getPrototypeOf": (
    target: null | InternalReference,
  ) => null | InternalReference;
  "Reflect.ownKeys": (target: null | InternalReference) => (string | symbol)[];
  "Reflect.isExtensible": (target: null | InternalReference) => boolean;
  "Reflect.set": (
    target: null | InternalReference,
    key: ExternalValue,
    value: InternalValue,
    receiver: InternalValue,
  ) => boolean;
  "Reflect.deleteProperty": (
    target: null | InternalReference,
    key: ExternalValue,
  ) => boolean;
  "Reflect.setPrototypeOf": (
    target: null | InternalReference,
    prototype: null | InternalReference,
  ) => unknown;
  "Reflect.getOwnPropertyDescriptor": (
    target: null | InternalReference,
    key: ExternalValue,
  ) => InternalDescriptor | undefined;
  "Reflect.preventExtensions": (target: null | InternalReference) => boolean;
  "Reflect.defineProperty": (
    target: null | InternalReference,
    key: ExternalValue,
    descriptor: null | InternalDescriptor,
  ) => boolean;
  // Aran //
  "aran.get": (
    target: null | InternalValue,
    key: ExternalValue,
  ) => InternalValue;
  "aran.createObject": (
    prototype: null | InternalReference,
    ...properties: (InternalValue | ExternalValue)[]
  ) => InternalReference;
};

export type Application = {
  [key in keyof IntrinsicRecord]: (
    callee: IntrinsicRecord[key],
    that: InternalValue,
    args: InternalValue[],
    membrane: Membrane,
  ) => InternalValue;
};
