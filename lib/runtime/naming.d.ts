import type { Map } from "../util/collection";

export type AranName =
  | "aran.get"
  | "aran.createObject"
  | "aran.sliceObject"
  | "aran.listForInKey";

export type ReflectName =
  | "Reflect.apply"
  | "Reflect.construct"
  | "Reflect.getPrototypeOf"
  | "Reflect.setPrototypeOf"
  | "Reflect.preventExtensions"
  | "Reflect.isExtensible"
  | "Reflect.getOwnPropertyDescriptor"
  | "Reflect.defineProperty"
  | "Reflect.deleteProperty"
  | "Reflect.ownKeys"
  | "Reflect.has"
  | "Reflect.get"
  | "Reflect.set";

export type ArrayName = "Array.of";

export type ObjectName = "Object.create";

export type GlobalName = ReflectName | ArrayName | ObjectName;

export type Name = AranName | GlobalName;

export type Naming = Map<Function, Name>;
