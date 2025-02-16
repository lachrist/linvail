import { LinvailExecError } from "../../error.mjs";
import { isPrimitive } from "../../util/primitive.mjs";
import {
  atExternal,
  atInternal,
  fromInternalDescriptor,
  fromPlainInternalArrayWithExternalPrototype,
  getInternalDescriptorValue,
  toBoolean,
  toInternalDefineDescriptor,
  toInternalPrototype,
  toInternalReferenceSloppy,
  toInternalReferenceStrict,
  toPropertyKey,
} from "../convert.mjs";
import { isDataDescriptor } from "../domain.mjs";
import {
  applyInternal,
  defineInternalPropertyDescriptor,
  getInternalOwnPropertyDescriptor,
  getInternalPropertyValue,
  listInternalOwnPropertyKey,
  setInternalPropertyValue,
} from "../reflect.mjs";
import {
  enterPlainExternalReference,
  enterPrimitive,
  isInternalPrimitive,
  leavePrimitive,
} from "../region/core.mjs";
import { leaveValue } from "../region/util.mjs";

/** @type {import("../oracle").ApplyOracleMapping} */
export const object_apply_oracle_mapping = {
  "global.Object.assign": (region, _that, args) => {
    const { "global.TypeError": TypeError } = region;
    const target = toInternalReferenceSloppy(
      region,
      atInternal(region, args, 0),
    );
    for (let index = 1; index < args.length; index++) {
      const original_source = atInternal(region, args, index);
      if (
        !isInternalPrimitive(region, original_source) ||
        leavePrimitive(region, original_source) != null
      ) {
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
                getInternalDescriptorValue(region, descriptor, source),
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
  "global.Object.create": (region, _that, args) => {
    const {
      "global.undefined": undefined,
      "global.Object.create": createObject,
    } = region;
    const prototype = toInternalPrototype(region, atInternal(region, args, 0));
    const raw_property_record = atInternal(region, args, 1);
    if (
      isInternalPrimitive(region, raw_property_record) &&
      leavePrimitive(region, raw_property_record) === undefined
    ) {
      return createObject(prototype);
    } else {
      const properties = toInternalReferenceSloppy(region, raw_property_record);
      const target = createObject(prototype);
      const keys = listInternalOwnPropertyKey(region, properties);
      const { length } = keys;
      for (let index = 0; index < length; index++) {
        const key = keys[index];
        const descriptor = getInternalOwnPropertyDescriptor(
          region,
          properties,
          key,
        );
        if (!descriptor) {
          throw new LinvailExecError("Missing descriptor", {
            key,
            properties,
          });
        }
        if (descriptor.enumerable) {
          defineInternalPropertyDescriptor(
            region,
            target,
            key,
            toInternalDefineDescriptor(
              region,
              isDataDescriptor(descriptor)
                ? descriptor.value
                : descriptor.get
                  ? applyInternal(region, descriptor.get, properties, [])
                  : enterPrimitive(region, undefined),
            ),
          );
        }
      }
      return target;
    }
  },
  "global.Object.defineProperties": (region, _that, args) => {
    const { "global.TypeError": TypeError } = region;
    const target = toInternalReferenceStrict(
      region,
      atInternal(region, args, 0),
    );
    const descriptors = toInternalReferenceSloppy(
      region,
      atInternal(region, args, 1),
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
  "global.Object.defineProperty": (region, _that, args) => {
    const { "global.TypeError": TypeError } = region;
    const target = toInternalReferenceStrict(
      region,
      atInternal(region, args, 0),
    );
    const key = toPropertyKey(region, atExternal(region, args, 1));
    const descriptor = toInternalDefineDescriptor(
      region,
      atInternal(region, args, 2),
    );
    if (!defineInternalPropertyDescriptor(region, target, key, descriptor)) {
      throw new TypeError("Failed to define property at Object.defineProperty");
    }
    return target;
  },
  "global.Object.entries": (region, _that, args) => {
    const {
      "global.Array": Array,
      "global.Array.of": createArray,
      "global.Reflect.defineProperty": defineProperty,
    } = region;
    const target = toInternalReferenceSloppy(
      region,
      atInternal(region, args, 0),
    );
    const keys = listInternalOwnPropertyKey(region, target);
    const entries = fromPlainInternalArrayWithExternalPrototype(
      region,
      new Array(0),
    );
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
          defineProperty(entries, length, {
            __proto__: null,
            value: fromPlainInternalArrayWithExternalPrototype(
              region,
              createArray(
                enterPrimitive(region, key),
                // This does not work because the get trap of proxies must be triggered
                // >> getInternalDescriptorValue(region, descriptor, target),
                getInternalPropertyValue(region, target, key, target),
              ),
            ),
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
  "global.Object.fromEntries": (region, _that, args) => {
    const {
      "global.TypeError": TypeError,
      "global.Object.create": createObject,
      "global.Symbol.iterator": iterator_symbol,
      "global.Object.prototype": object_prototype,
      "global.Reflect.defineProperty": defineProperty,
    } = region;
    const entries = toInternalReferenceSloppy(
      region,
      atInternal(region, args, 0),
    );
    const object = createObject(
      enterPlainExternalReference(region, object_prototype),
    );
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
      done = toBoolean(
        region,
        getInternalPropertyValue(region, step, "done", step),
      );
      if (!done) {
        const original_entry = getInternalPropertyValue(
          region,
          step,
          "value",
          step,
        );
        if (isInternalPrimitive(region, original_entry)) {
          const close = getInternalPropertyValue(
            region,
            iterator,
            "return",
            iterator,
          );
          if (!isInternalPrimitive(region, close)) {
            try {
              applyInternal(region, close, iterator, []);
            } catch {
              /* noop */
            }
          }
          throw new TypeError(
            "Iterator result should be an object at Object.fromEntries",
          );
        }
        const entry = toInternalReferenceStrict(
          region,
          getInternalPropertyValue(region, step, "value", step),
        );
        const entry0 = getInternalPropertyValue(region, entry, 0, entry);
        const entry1 = getInternalPropertyValue(region, entry, 1, entry);
        defineProperty(
          object,
          toPropertyKey(region, leaveValue(region, entry0)),
          {
            __proto__: null,
            value: entry1,
            writable: true,
            enumerable: true,
            configurable: true,
          },
        );
      }
    }
    return object;
  },
  "global.Object.getOwnPropertyDescriptor": (region, _that, args) => {
    const target = toInternalReferenceSloppy(
      region,
      atInternal(region, args, 0),
    );
    const key = toPropertyKey(region, atExternal(region, args, 1));
    const descriptor = getInternalOwnPropertyDescriptor(region, target, key);
    return descriptor
      ? fromInternalDescriptor(region, descriptor)
      : enterPrimitive(region, descriptor);
  },
  "global.Object.getOwnPropertyDescriptors": (region, _that, args) => {
    const {
      "global.Object.create": createObject,
      "global.Object.prototype": object_prototype,
    } = region;
    const target = toInternalReferenceSloppy(
      region,
      atInternal(region, args, 0),
    );
    const keys = listInternalOwnPropertyKey(region, target);
    const descriptors = createObject(
      enterPlainExternalReference(region, object_prototype),
    );
    for (let index = 0; index < keys.length; index++) {
      const key = keys[index];
      const descriptor = getInternalOwnPropertyDescriptor(region, target, key);
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
  "global.Object.getOwnPropertyNames": (region, _that, args) => {
    const {
      "global.Array": Array,
      "global.Reflect.defineProperty": defineProperty,
    } = region;
    const target = toInternalReferenceSloppy(
      region,
      atInternal(region, args, 0),
    );
    const keys = listInternalOwnPropertyKey(region, target);
    const strings = fromPlainInternalArrayWithExternalPrototype(
      region,
      new Array(0),
    );
    let length = 0;
    for (let index = 0; index < keys.length; index++) {
      const key = keys[index];
      if (typeof key === "string") {
        defineProperty(strings, length, {
          __proto__: null,
          value: enterPrimitive(region, key),
          writable: true,
          enumerable: true,
          configurable: true,
        });
        length++;
      }
    }
    return strings;
  },
  "global.Object.getOwnPropertySymbols": (region, _that, args) => {
    const {
      "global.Array": Array,
      "global.Reflect.defineProperty": defineProperty,
    } = region;
    const target = toInternalReferenceSloppy(
      region,
      atInternal(region, args, 0),
    );
    const keys = listInternalOwnPropertyKey(region, target);
    const strings = fromPlainInternalArrayWithExternalPrototype(
      region,
      new Array(0),
    );
    let length = 0;
    for (let index = 0; index < keys.length; index++) {
      const key = keys[index];
      if (typeof key === "symbol") {
        defineProperty(strings, length, {
          __proto__: null,
          value: enterPrimitive(region, key),
          writable: true,
          enumerable: true,
          configurable: true,
        });
        length++;
      }
    }
    return strings;
  },
  "global.Object.keys": (region, _that, args) => {
    const {
      "global.Array": Array,
      "global.Reflect.defineProperty": defineProperty,
    } = region;
    const target = toInternalReferenceSloppy(
      region,
      atInternal(region, args, 0),
    );
    const keys = listInternalOwnPropertyKey(region, target);
    const result = fromPlainInternalArrayWithExternalPrototype(
      region,
      new Array(0),
    );
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
            !defineProperty(result, length, {
              __proto__: null,
              value: enterPrimitive(region, key),
              writable: true,
              enumerable: true,
              configurable: true,
            })
          ) {
            throw new LinvailExecError(
              "Cannot define property at Object.values",
              { values: result, length, key, descriptor },
            );
          }
          length++;
        }
      }
    }
    return result;
  },
  "global.Object.values": (region, _that, args) => {
    const {
      "global.Array": Array,
      "global.Reflect.defineProperty": defineProperty,
    } = region;
    const target = toInternalReferenceSloppy(
      region,
      atInternal(region, args, 0),
    );
    const keys = listInternalOwnPropertyKey(region, target);
    const result = fromPlainInternalArrayWithExternalPrototype(
      region,
      new Array(0),
    );
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
            !defineProperty(result, length, {
              __proto__: null,
              value: getInternalDescriptorValue(region, descriptor, target),
              writable: true,
              enumerable: true,
              configurable: true,
            })
          ) {
            throw new LinvailExecError(
              "Cannot define property at Object.values",
              { values: result, length, key, descriptor },
            );
          }
          length++;
        }
      }
    }
    return result;
  },
};
