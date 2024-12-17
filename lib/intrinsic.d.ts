import {
  Reflect,
  Reference,
  Descriptor,
  Primitive,
  RawValue,
  RawReference,
  Value,
} from "./reflect";
import { Lifecycle, Membrane, Proxy } from "./membrane";

export type ReflectIntrinsicRecord = {
  "Reflect.get": Reflect["get"];
  "Reflect.has": Reflect["has"];
  "Reflect.construct": Reflect["construct"];
  "Reflect.apply": Reflect["apply"];
  "Reflect.defineProperty": Reflect["defineProperty"];
  "Reflect.getOwnPropertyDescriptor": Reflect["getOwnPropertyDescriptor"];
  "Reflect.setPrototypeOf": Reflect["setPrototypeOf"];
  "Reflect.getPrototypeOf": Reflect["getPrototypeOf"];
  "Reflect.ownKeys": Reflect["ownKeys"];
  "Reflect.isExtensible": Reflect["isExtensible"];
  "Reflect.set": Reflect["set"];
  "Reflect.deleteProperty": Reflect["deleteProperty"];
};

export type ObjectIntrinsicRecord = {
  "Object.prototype": RawReference;
  "Object.create": <X>(
    prototype: null | Reference<X>,
    properties: { [key in PropertyKey]: Descriptor<X> },
  ) => Reference<X>;
  "Object.assign": <X>(target: X, ...sources: X[]) => Reference<X>;
  "Object.keys": <X>(target: X) => string[];
  "Object.defineProperty": <X>(
    target: X,
    key: RawValue,
    descriptor: Descriptor<X>,
  ) => X;
  "Object.setPrototypeOf": <X>(
    target: X,
    prototype: null | undefined | Reference<X>,
  ) => X;
  "Object.getPrototypeOf": <X>(target: X) => null | Reference<X>;
};

export type ArrayIntrinsicRecord = {
  "Array.prototype": RawReference;
  "Array.from": (...args: unknown[]) => unknown;
  "Array.of": <X>(...elements: X[]) => Reference<X>;
  "Array.prototype.flat": (this: unknown, ...args: unknown[]) => unknown;
  "Array.prototype.values": (this: unknown, ...args: unknown[]) => unknown;
  "Array.prototype.concat": <X>(
    this: Reference<X>,
    ...arrays: Reference<X>[]
  ) => Reference<X>;
  "Array.prototype.slice": (this: unknown, ...args: unknown[]) => unknown;
  "Array.prototype.push": <X>(
    this: Reference<X>,
    ...elements: Reference<X>[]
  ) => Number;
};

export type AranIntrinsicRecord = {
  "aran.unary": (operator: string, argument: RawValue) => Primitive;
  "aran.binary": (
    operator: string,
    left: RawValue,
    right: RawValue,
  ) => Primitive;
  "aran.toArgumentList": <X>(
    array: X[],
    callee: null | Reference<X>,
  ) => unknown;
  "aran.sliceObject": <X>(
    object: Reference<X>,
    exclusion: { [key in PropertyKey]: null },
  ) => { [key in PropertyKey]: X };
  "aran.listForInKey": <X>(object: Reference<X>) => string[];
  "aran.listRest": <X>(
    iterator: Reference<X>,
    result: Reference<X>,
  ) => Reference<X>[];
  "aran.get": <X>(target: Value<X>, key: RawValue) => X;
  "aran.createObject": <X>(
    prototype: null | Reference<X>,
    ...properties: (PropertyKey | X)[]
  ) => Reference<X>;
};

export type OtherIntrinsicRecord = {
  Proxy: Proxy;
};

export type IntrinsicRecord = ReflectIntrinsicRecord &
  ObjectIntrinsicRecord &
  ArrayIntrinsicRecord &
  AranIntrinsicRecord &
  OtherIntrinsicRecord;

export type Application = {
  [key in keyof IntrinsicRecord]?: <X>(
    callee: IntrinsicRecord[key],
    that: X,
    args: X[],
    options: Lifecycle<X> &
      Membrane<X, RawValue> & {
        intrinsics: IntrinsicRecord;
      },
  ) => X;
};
