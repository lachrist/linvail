import { map } from "../../util.mjs";

const {
  Object: { entries: listEntry, fromEntries: reduceEntry },
} = globalThis;

/**
 * @type {<T>(
 *   config: import("./convert").Config,
 * ) => (
 *   referekce: 
 * ) => }
*/
const compileInternalizePrototype = ({
  global: {
    TypeError,
    Reflect: { getPrototypeOf, setPrototypeOf },
  },
  region: { enterPrototype },
}) =>
(target) => {
  if (setPrototypeOf(target, enterPrototype(getPrototypeOf(target)))) {
    return /** @type {any} */ (target);
  } else {
    throw new TypeError("Failed to harmonize prototype");
  }
},

/**
 * @type {{
 *   [key in keyof import("./convert").Convert]: (
 *     config: import("./convert").Config,
 *   ) => import("./convert").Convert[key]
 * }}
 */
const compilers = {
  toSloppyTarget:
    ({
      global: { TypeError, Object },
      region: {
        enterPlainExternalReference,
        isInternalPrimitive,
        leavePrimitive,
      },
    }) =>
    (value) => {
      if (isInternalPrimitive(value)) {
        const primitive = leavePrimitive(value);
        if (primitive == null) {
          throw new TypeError("Cannot convert null or undefined to object");
        } else {
          return enterPlainExternalReference(Object(primitive));
        }
      } else {
        return value;
      }
    },
  toStrictTarget:
    ({ global: { TypeError }, region: { isInternalPrimitive } }) =>
    (value) => {
      if (isInternalPrimitive(value)) {
        throw new TypeError("Cannot convert primitive to object");
      } else {
        return value;
      }
    },
  fromPrimitiveArray:
    ({
      region: { enterPrimitive },
      global: {
        undefined,
        Reflect: { apply },
        Array: { of },
      },
    }) =>
    (primitives) =>
      internalizeArrayPrototype(
        apply(of, undefined, map(primitives, enterPrimitive)),
      ),
  internalizeObjectPrototype:
    ({
      global: {
        TypeError,
        Reflect: { getPrototypeOf, setPrototypeOf },
      },
      region: { enterPrototype },
    }) =>
    (target) => {
      if (setPrototypeOf(target, enterPrototype(getPrototypeOf(target)))) {
        return /** @type {any} */ (target);
      } else {
        throw new TypeError("Failed to harmonize prototype");
      }
    },
  internalizeArrayPrototype:
    ({
      global: {
        TypeError,
        Reflect: { getPrototypeOf, setPrototypeOf },
      },
      region: { enterPrototype },
    }) =>
    (target) => {
      if (setPrototypeOf(target, enterPrototype(getPrototypeOf(target)))) {
        return /** @type {any} */ (target);
      } else {
        throw new TypeError("Failed to harmonize prototype");
      }
    },
  toInternalDefineDescriptor:
    ({
      global: { TypeError },
      reflect: { has, get },
      region: { isInternalPrimitive, leaveValue },
    }) =>
    (value) => {
      if (isInternalPrimitive(value)) {
        throw new TypeError("Cannot convert primitive to descriptor");
      } else {
        /**
         * @type {import("../domain").DefineDescriptor<
         *   import("../domain").InternalValue,
         *   import("../domain").InternalReference,
         * >}
         */
        const descriptor = { __proto__: null };
        if (has(value, "value")) {
          descriptor.value = get(value, "value", value);
        }
        if (has(value, "writable")) {
          descriptor.writable = !!leaveValue(get(value, "writable", value));
        }
        if (has(value, "enumerable")) {
          descriptor.enumerable = !!leaveValue(get(value, "enumerable", value));
        }
        if (has(value, "configurable")) {
          descriptor.configurable = !!leaveValue(
            get(value, "configurable", value),
          );
        }
        if (has(value, "get")) {
          const getter = get(value, "get", value);
          if (isInternalPrimitive(getter)) {
            throw new TypeError("Cannot convert primitive to getter");
          } else {
            descriptor.get = getter;
          }
        }
        if (has(value, "set")) {
          const setter = get(value, "set", value);
          if (isInternalPrimitive(setter)) {
            throw new TypeError("Cannot convert primitive to setter");
          } else {
            descriptor.set = setter;
          }
        }
        return descriptor;
      }
    },
  atInternal:
    ({ global: { undefined }, region: { enterPrimitive } }) =>
    (array, index) =>
      index < array.length ? array[index] : enterPrimitive(undefined),
  atExternal:
    ({ global: { undefined }, region: { leaveValue } }) =>
    (array, index) =>
      index < array.length ? leaveValue(array[index]) : undefined,
  fromInternalPrototype:
    ({ region: { enterPrimitive } }) =>
    (prototype) =>
      prototype === null ? enterPrimitive(null) : prototype,
  toInternalPrototype:
    ({
      global: { TypeError, Object, undefined },
      region: {
        isInternalPrimitive,
        leavePrimitive,
        enterPlainExternalReference,
      },
    }) =>
    (prototype) => {
      if (isInternalPrimitive(prototype)) {
        const primitive = leavePrimitive(prototype);
        if (primitive === null) {
          return null;
        } else if (primitive === undefined) {
          throw new TypeError("Cannot convert undefined to prototype");
        } else {
          return enterPlainExternalReference(Object(primitive));
        }
      } else {
        return prototype;
      }
    },
};

/**
 * @type {(
 *  config: import("./convert").Config,
 * ) => import("./convert").Convert}
 */
export const compileConvert = (config) =>
  /** @type {any} */ (
    reduceEntry(
      map(listEntry(compilers), ({ 0: key, 1: compile }) => [
        key,
        compile(config),
      ]),
    )
  );
