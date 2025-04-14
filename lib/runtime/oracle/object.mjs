import {
  atExternal,
  atInternal,
  closeIterator,
  fromInternalDescriptor,
  getInternalDescriptorValue,
  getLength,
  toInternalDefineDescriptor,
  toPrototype,
  toInternalReferenceSloppy,
  toInternalReferenceStrict,
  toPropertyKey,
  void_oracle,
} from "./helper.mjs";
import {
  applyInternal,
  defineInternalPropertyDescriptor,
  getInternalOwnPropertyDescriptor,
  getInternalPropertyValue,
  listInternalOwnPropertyKey,
  setInternalPropertyValue,
} from "../reflect.mjs";
import {
  wrapStandardPrimitive,
  wrapValue,
  wrapReference,
} from "../region/core.mjs";
import {
  createEmptyArray,
  createEmptyObject,
  createFullArray,
} from "../region/create.mjs";

/**
 * @type {Record<
 *   (
 *     | "global.Object"
 *     | `global.Object.${keyof typeof Object}`
 *   ),
 *   import("../oracle.d.ts").Oracle
 * >}
 */
export const object_oracle_record = {
  "global.Object": {
    construct: (region, input, new_target) => {
      const {
        "global.Object": Object,
        "global.Object.prototype": object_prototype,
      } = region;
      if (new_target.inner === Object) {
        const internal = atInternal(region, input, 0);
        if (internal.inner == null) {
          return createEmptyObject(region, object_prototype);
        }
        if (internal.type === "primitive") {
          return wrapReference(region, Object(internal.inner));
        } else {
          return internal;
        }
      } else {
        const prototype = getInternalPropertyValue(
          region,
          new_target,
          "prototype",
          new_target,
        );
        if (prototype.type === "primitive") {
          // BREAKAGE: it should be the Object.prototype from the new_targets' realm
          return createEmptyObject(region, object_prototype);
        } else {
          return createEmptyObject(region, prototype.inner);
        }
      }
    },
    apply: (region, _that, input) => {
      const {
        "global.Object": Object,
        "global.Object.prototype": object_prototype,
      } = region;
      const internal = atInternal(region, input, 0);
      if (internal.inner == null) {
        return createEmptyObject(region, object_prototype);
      }
      if (internal.type === "primitive") {
        return wrapReference(region, Object(internal.inner));
      } else {
        return internal;
      }
    },
  },
  "global.Object.prototype": void_oracle, // not a function
  "global.Object.assign": {
    construct: null,
    apply: (region, _that, input) => {
      const { "global.TypeError": TypeError } = region;
      const target = toInternalReferenceSloppy(
        region,
        atInternal(region, input, 0),
      );
      for (let index = 1; index < input.length; index++) {
        const original_source = atInternal(region, input, index);
        if (original_source.inner != null) {
          const source = toInternalReferenceSloppy(region, original_source);
          const keys = listInternalOwnPropertyKey(region, source);
          for (let index = 0; index < keys.length; index++) {
            const key = keys[index];
            const descriptor = getInternalOwnPropertyDescriptor(
              region,
              source,
              key,
            );
            if (descriptor && descriptor.enumerable) {
              if (
                !setInternalPropertyValue(
                  region,
                  target,
                  key,
                  getInternalPropertyValue(region, source, key, source),
                  target,
                )
              ) {
                throw new TypeError("Cannot set property at Object.assign");
              }
            }
          }
        }
      }
      return target;
    },
  },
  "global.Object.create": {
    construct: null,
    apply: (region, _that, input) => {
      const { "global.undefined": undefined } = region;
      const prototype = toPrototype(region, atInternal(region, input, 0));
      const raw_property_record = atInternal(region, input, 1);
      if (raw_property_record.inner === undefined) {
        return createEmptyObject(region, prototype);
      } else {
        const properties = toInternalReferenceSloppy(
          region,
          raw_property_record,
        );
        const target = createEmptyObject(region, prototype);
        const keys = listInternalOwnPropertyKey(region, properties);
        const { length } = keys;
        for (let index = 0; index < length; index++) {
          const key = keys[index];
          const descriptor = getInternalOwnPropertyDescriptor(
            region,
            properties,
            key,
          );
          if (descriptor && descriptor.enumerable) {
            defineInternalPropertyDescriptor(
              region,
              target,
              key,
              toInternalDefineDescriptor(
                region,
                getInternalDescriptorValue(region, descriptor, properties),
              ),
            );
          }
        }
        return target;
      }
    },
  },
  "global.Object.defineProperties": {
    construct: null,
    apply: (region, _that, input) => {
      const { "global.TypeError": TypeError } = region;
      const target = toInternalReferenceStrict(
        region,
        atInternal(region, input, 0),
      );
      const descriptors = toInternalReferenceSloppy(
        region,
        atInternal(region, input, 1),
      );
      const keys = listInternalOwnPropertyKey(region, descriptors);
      for (let index = 0; index < keys.length; index++) {
        const key = keys[index];
        const descriptor = getInternalOwnPropertyDescriptor(
          region,
          descriptors,
          key,
        );
        if (descriptor && descriptor.enumerable) {
          if (
            !defineInternalPropertyDescriptor(
              region,
              target,
              key,
              toInternalDefineDescriptor(
                region,
                getInternalPropertyValue(region, descriptors, key, descriptors),
              ),
            )
          ) {
            throw new TypeError(
              "Failed to define property at Object.defineProperties",
            );
          }
        }
      }
      return target;
    },
  },
  "global.Object.defineProperty": {
    construct: null,
    apply: (region, _that, input) => {
      const { "global.TypeError": TypeError } = region;
      const target = toInternalReferenceStrict(
        region,
        atInternal(region, input, 0),
      );
      const key = toPropertyKey(region, atExternal(region, input, 1));
      const descriptor = toInternalDefineDescriptor(
        region,
        atInternal(region, input, 2),
      );
      if (!defineInternalPropertyDescriptor(region, target, key, descriptor)) {
        throw new TypeError(
          "Failed to define property at Object.defineProperty",
        );
      }
      return target;
    },
  },
  "global.Object.entries": {
    construct: null,
    apply: (region, _that, input) => {
      const { "global.Reflect.defineProperty": defineProperty } = region;
      const target = toInternalReferenceSloppy(
        region,
        atInternal(region, input, 0),
      );
      const keys = listInternalOwnPropertyKey(region, target);
      const entries = createEmptyArray(region, 0);
      let length = 0;
      for (let index = 0; index < keys.length; index++) {
        const key = keys[index];
        if (typeof key === "string") {
          const descriptor = getInternalOwnPropertyDescriptor(
            region,
            target,
            key,
          );
          if (descriptor && descriptor.enumerable) {
            defineProperty(entries.plain, length, {
              __proto__: null,
              value: createFullArray(region, [
                wrapStandardPrimitive(region, key),
                getInternalPropertyValue(region, target, key, target),
              ]),
              writable: true,
              enumerable: true,
              configurable: true,
            });
            length++;
          }
        }
      }
      return entries;
    },
  },
  "global.Object.freeze": void_oracle, // no benefit
  "global.Object.fromEntries": {
    construct: null,
    apply: (region, _that, input) => {
      const {
        "global.TypeError": TypeError,
        "global.Symbol.iterator": iterator_symbol,
        "global.Object.prototype": object_prototype,
        "global.Reflect.defineProperty": defineProperty,
      } = region;
      const entries = toInternalReferenceSloppy(
        region,
        atInternal(region, input, 0),
      );
      const object = createEmptyObject(region, object_prototype);
      const iterator = toInternalReferenceStrict(
        region,
        applyInternal(
          region,
          toInternalReferenceStrict(
            region,
            getInternalPropertyValue(region, entries, iterator_symbol, entries),
          ),
          entries,
          [],
        ),
      );
      const next = toInternalReferenceStrict(
        region,
        getInternalPropertyValue(region, iterator, "next", iterator),
      );
      let done = false;
      while (!done) {
        const step = toInternalReferenceStrict(
          region,
          applyInternal(region, next, iterator, []),
        );
        done = !!getInternalPropertyValue(region, step, "done", step).inner;
        if (!done) {
          const original_entry = getInternalPropertyValue(
            region,
            step,
            "value",
            step,
          );
          if (original_entry.type === "primitive") {
            closeIterator(region, iterator);
            throw new TypeError(
              "Iterator result should be an object at Object.fromEntries",
            );
          }
          const entry = toInternalReferenceStrict(
            region,
            getInternalPropertyValue(region, step, "value", step),
          );
          let key, val;
          try {
            const entry0 = getInternalPropertyValue(region, entry, 0, entry);
            const entry1 = getInternalPropertyValue(region, entry, 1, entry);
            key = toPropertyKey(region, entry0.inner);
            val = entry1;
          } catch (error) {
            closeIterator(region, iterator);
            throw error;
          }
          if (
            !defineProperty(object.plain, key, {
              __proto__: null,
              value: val,
              writable: true,
              enumerable: true,
              configurable: true,
            })
          ) {
            throw new TypeError("Cannot define property at Object.fromEntries");
          }
        }
      }
      return object;
    },
  },
  "global.Object.getOwnPropertyDescriptor": {
    construct: null,
    apply: (region, _that, input) => {
      const target = toInternalReferenceSloppy(
        region,
        atInternal(region, input, 0),
      );
      const key = toPropertyKey(region, atExternal(region, input, 1));
      const descriptor = getInternalOwnPropertyDescriptor(region, target, key);
      return descriptor
        ? fromInternalDescriptor(region, descriptor)
        : wrapStandardPrimitive(region, descriptor);
    },
  },
  "global.Object.getOwnPropertyDescriptors": {
    construct: null,
    apply: (region, _that, input) => {
      const { "global.Object.prototype": object_prototype } = region;
      const target = toInternalReferenceSloppy(
        region,
        atInternal(region, input, 0),
      );
      const keys = listInternalOwnPropertyKey(region, target);
      const descriptors = createEmptyObject(region, object_prototype);
      for (let index = 0; index < keys.length; index++) {
        const key = keys[index];
        const descriptor = getInternalOwnPropertyDescriptor(
          region,
          target,
          key,
        );
        if (descriptor) {
          defineInternalPropertyDescriptor(region, descriptors, key, {
            __proto__: null,
            value: fromInternalDescriptor(region, descriptor),
            writable: true,
            enumerable: true,
            configurable: true,
          });
        }
      }
      return descriptors;
    },
  },
  "global.Object.getOwnPropertyNames": {
    construct: null,
    apply: (region, _that, input) => {
      const { "global.Reflect.defineProperty": defineProperty } = region;
      const target = toInternalReferenceSloppy(
        region,
        atInternal(region, input, 0),
      );
      const keys = listInternalOwnPropertyKey(region, target);
      const strings = createEmptyArray(region, 0);
      let length = 0;
      for (let index = 0; index < keys.length; index++) {
        const key = keys[index];
        if (typeof key === "string") {
          defineProperty(strings.plain, length, {
            __proto__: null,
            value: wrapStandardPrimitive(region, key),
            writable: true,
            enumerable: true,
            configurable: true,
          });
          length++;
        }
      }
      return strings;
    },
  },
  "global.Object.getOwnPropertySymbols": {
    construct: null,
    apply: (region, _that, input) => {
      const { "global.Reflect.defineProperty": defineProperty } = region;
      const target = toInternalReferenceSloppy(
        region,
        atInternal(region, input, 0),
      );
      const keys = listInternalOwnPropertyKey(region, target);
      const strings = createEmptyArray(region, 0);
      let length = 0;
      for (let index = 0; index < keys.length; index++) {
        const key = keys[index];
        if (typeof key === "symbol") {
          defineProperty(strings.plain, length, {
            __proto__: null,
            value: wrapValue(region, key),
            writable: true,
            enumerable: true,
            configurable: true,
          });
          length++;
        }
      }
      return strings;
    },
  },
  "global.Object.getPrototypeOf": void_oracle, // no benefit
  "global.Object.groupBy": {
    construct: null,
    apply: (region, _that, input) => {
      const {
        "global.undefined": undefined,
        "global.Reflect.defineProperty": defineProperty,
        "global.Symbol.iterator": iterator_symbol,
        "global.TypeError": TypeError,
      } = region;
      const items = toInternalReferenceSloppy(
        region,
        atInternal(region, input, 0),
      );
      const callback = toInternalReferenceSloppy(
        region,
        atInternal(region, input, 1),
      );
      if (typeof callback.inner !== "function") {
        throw new TypeError("Callback is not a function at Object.groupBy");
      }
      const result = createEmptyObject(region, null);
      const iterator = toInternalReferenceStrict(
        region,
        applyInternal(
          region,
          toInternalReferenceStrict(
            region,
            getInternalPropertyValue(region, items, iterator_symbol, items),
          ),
          items,
          [],
        ),
      );
      const next = toInternalReferenceStrict(
        region,
        getInternalPropertyValue(region, iterator, "next", iterator),
      );
      let done = false;
      /**
       * @type {{
       *   [key in PropertyKey]?:
       *     import("../domain.d.ts").HostReferenceWrapper<"array">
       * }}
       */
      const groups = /** @type {any} */ ({ __proto__: null });
      let index = 0;
      while (!done) {
        const step = toInternalReferenceStrict(
          region,
          applyInternal(region, next, iterator, []),
        );
        done = !!getInternalPropertyValue(region, step, "done", step).inner;
        if (!done) {
          const item = getInternalPropertyValue(region, step, "value", step);
          const key = toPropertyKey(
            region,
            applyInternal(
              region,
              callback,
              wrapStandardPrimitive(region, undefined),
              [item, wrapStandardPrimitive(region, index++)],
            ).inner,
          );
          let group = groups[key];
          if (!group) {
            group = createEmptyArray(region, 0);
            groups[key] = group;
            if (
              !defineProperty(result.plain, key, {
                __proto__: null,
                value: group,
                writable: true,
                enumerable: true,
                configurable: true,
              })
            ) {
              throw new TypeError("Cannot define group at Object.groupBy");
            }
          }
          const length = getLength(region, group);
          if (
            !defineProperty(group.plain, length, {
              __proto__: null,
              value: item,
              writable: true,
              enumerable: true,
              configurable: true,
            })
          ) {
            throw new TypeError("Cannot set group index at Object.groupBy");
          }
        }
      }
      return result;
    },
  },
  "global.Object.hasOwn": void_oracle, // no benefit
  "global.Object.is": void_oracle, // no benefit
  "global.Object.isExtensible": void_oracle, // no benefit
  "global.Object.isFrozen": void_oracle, // no benefit
  "global.Object.isSealed": void_oracle, // no benefit
  "global.Object.keys": {
    construct: null,
    apply: (region, _that, input) => {
      const {
        "global.TypeError": TypeError,
        "global.Reflect.defineProperty": defineProperty,
      } = region;
      const target = toInternalReferenceSloppy(
        region,
        atInternal(region, input, 0),
      );
      const keys = listInternalOwnPropertyKey(region, target);
      const result = createEmptyArray(region, 0);
      let length = 0;
      for (let index = 0; index < keys.length; index++) {
        const key = keys[index];
        if (typeof key === "string") {
          const descriptor = getInternalOwnPropertyDescriptor(
            region,
            target,
            key,
          );
          if (descriptor && descriptor.enumerable) {
            if (
              !defineProperty(result.plain, length, {
                __proto__: null,
                value: wrapStandardPrimitive(region, key),
                writable: true,
                enumerable: true,
                configurable: true,
              })
            ) {
              throw new TypeError("Cannot define property at Object.keys");
            }
            length++;
          }
        }
      }
      return result;
    },
  },
  "global.Object.preventExtensions": void_oracle, // no benefit
  "global.Object.seal": void_oracle, // no benefit
  "global.Object.setPrototypeOf": void_oracle, // no benefit
  "global.Object.values": {
    construct: null,
    apply: (region, _that, input) => {
      const {
        "global.TypeError": TypeError,
        "global.Reflect.defineProperty": defineProperty,
      } = region;
      const target = toInternalReferenceSloppy(
        region,
        atInternal(region, input, 0),
      );
      const keys = listInternalOwnPropertyKey(region, target);
      const result = createEmptyArray(region, 0);
      let length = 0;
      for (let index = 0; index < keys.length; index++) {
        const key = keys[index];
        if (typeof key === "string") {
          const descriptor = getInternalOwnPropertyDescriptor(
            region,
            target,
            key,
          );
          if (descriptor && descriptor.enumerable) {
            if (
              !defineProperty(result.plain, length, {
                __proto__: null,
                value: getInternalPropertyValue(region, target, key, target),
                writable: true,
                enumerable: true,
                configurable: true,
              })
            ) {
              throw new TypeError("Cannot define property at Object.values");
            }
            length++;
          }
        }
      }
      return result;
    },
  },
};
