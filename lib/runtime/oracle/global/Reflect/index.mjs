import * as internal from "node:stream";
import { toPropertyKey } from "../../../domain.mjs";

/**
 * @type {{
 *   [key in keyof typeof Reflect]: import("../..").CompileOracle,
 * }}
 */
export default {
  apply: TODO,
  construct: TODO,
  preventExtensions: TODO,
  isExtensible: TODO,
  getPrototypeOf: TODO,
  setPrototypeOf: TODO,
  defineProperty: TODO,
  getOwnPropertyDescriptor: TODO,
  deleteProperty: TODO,
  ownKeys: ({
    region: { enterPrimitive },
    reflect: { ownKeys },
    convert: { toStrictTarget, atInternal, internalizeArrayPrototype },
  }) => ({
    apply: (_that, args) => {
      const target = toStrictTarget(atInternal(args, 0));
      /** @type {any[]} */
      const keys = ownKeys(target);
      const { length } = keys;
      for (let index = 0; index < length; index++) {
        keys[index] = enterPrimitive(keys[index]);
      }
      return internalizeArrayPrototype(/** @type {any} */ (keys));
    },
    construct: null,
  }),
  has: ({
    reflect: { has },
    convert: { toStrictTarget, atInternal, atExternal },
    region: { enterPrimitive },
  }) => ({
    apply: (_that, args) => {
      const target = toStrictTarget(atInternal(args, 0));
      const key = toPropertyKey(atExternal(args, 1));
      return enterPrimitive(has(target, key));
    },
    construct: null,
  }),
  get: ({
    reflect: { get },
    convert: { toStrictTarget, atInternal, atExternal },
  }) => ({
    apply: (_that, args) => {
      const target = toStrictTarget(atInternal(args, 0));
      const key = toPropertyKey(atExternal(args, 1));
      const receiver = args.length < 3 ? target : args[2];
      return get(target, key, receiver);
    },
    construct: null,
  }),
  set: ({
    reflect: { set },
    convert: { atInternal, atExternal, toStrictTarget },
    region: { enterPrimitive },
  }) => ({
    apply: (_that, args) => {
      const target = toStrictTarget(atInternal(args, 0));
      const key = toPropertyKey(atExternal(args, 1));
      const value = atInternal(args, 2);
      const receiver = args.length < 4 ? target : args[3];
      return enterPrimitive(set(target, key, value, receiver));
    },
    construct: null,
  }),
};
