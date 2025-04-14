import {
  createSafeMap,
  createSafeSet,
  createSafeWeakMap,
  createSafeWeakSet,
} from "../../util/collection.mjs";
import { applyInternal, getInternalPropertyValue } from "../reflect.mjs";
import { wrapStandardPrimitive } from "../region/core.mjs";
import { createEmptyObject } from "../region/create.mjs";
import {
  atInternal,
  getLength,
  toInternalReferenceStrict,
  toMaybeInternalReferenceStrict,
  toPrototype,
  void_oracle,
} from "./helper.mjs";

/**
 * @type {<K extends object, V>(
 *   weakmap: import("../../util/collection.d.ts").SafeWeakMap<K, V>,
 *   key: K,
 *   Error: new (message: string) => Error,
 * ) => V}
 */
const getWeakMapStrict = (weakmap, key, Error) => {
  const result = weakmap.$get(key);
  if (!result) {
    throw new Error("Incompatible receiver");
  }
  return result;
};

/**
 * @type {Record<
 *   (
 *     | `linvail.${"is" | "dir"}`
 *     | `linvail.${"Map" | "Set" | "WeakMap" | "WeakSet"}`
 *     | `linvail.Map.prototype.${keyof import("../../library/library.d.ts").LinvailMapPrototype}`
 *     | `linvail.Set.prototype.${keyof import("../../library/library.d.ts").LinvailSetPrototype}`
 *     | `linvail.WeakMap.prototype.${keyof import("../../library/library.d.ts").LinvailWeakMapPrototype}`
 *     | `linvail.WeakSet.prototype.${keyof import("../../library/library.d.ts").LinvailWeakSetPrototype}`
 *   ),
 *   import("../oracle.d.ts").Oracle
 * >}
 */
export const linvail_oracle_record = {
  "linvail.WeakSet": {
    construct: (region, input, new_target) => {
      const { weak_set_registry } = region;
      const argument0 = toMaybeInternalReferenceStrict(
        region,
        atInternal(region, input, 0),
      );
      /**
       * @type {import("../domain.d.ts").Wrapper[]}
       */
      const keys = [];
      if (argument0 !== null) {
        const length = getLength(region, argument0);
        for (let index = 0; index < length; index++) {
          keys[index] = getInternalPropertyValue(
            region,
            argument0,
            index,
            argument0,
          );
        }
      }
      const result = createEmptyObject(
        region,
        toPrototype(
          region,
          getInternalPropertyValue(region, new_target, "prototype", new_target),
        ),
      );
      weak_set_registry.$set(result, createSafeWeakSet(keys));
      return result;
    },
    apply: null,
  },
  "linvail.Set": {
    construct: (region, input, new_target) => {
      const { set_registry } = region;
      const argument0 = toMaybeInternalReferenceStrict(
        region,
        atInternal(region, input, 0),
      );
      /**
       * @type {import("../domain.d.ts").Wrapper[]}
       */
      const keys = [];
      if (argument0 !== null) {
        const length = getLength(region, argument0);
        for (let index = 0; index < length; index++) {
          keys[index] = getInternalPropertyValue(
            region,
            argument0,
            index,
            argument0,
          );
        }
      }
      const result = createEmptyObject(
        region,
        toPrototype(
          region,
          getInternalPropertyValue(region, new_target, "prototype", new_target),
        ),
      );
      set_registry.$set(result, createSafeSet(keys));
      return result;
    },
    apply: null,
  },
  "linvail.WeakMap": {
    construct: (region, input, new_target) => {
      const { weak_map_registry } = region;
      const argument0 = toMaybeInternalReferenceStrict(
        region,
        atInternal(region, input, 0),
      );
      /**
       * @type {[
       *   import("../domain.d.ts").Wrapper,
       *   import("../domain.d.ts").Wrapper,
       * ][]}
       */
      const entries = [];
      if (argument0 !== null) {
        const length = getLength(region, argument0);
        for (let index = 0; index < length; index++) {
          const entry = toInternalReferenceStrict(
            region,
            getInternalPropertyValue(region, argument0, index, argument0),
          );
          entries[index] = [
            getInternalPropertyValue(region, entry, 0, entry),
            getInternalPropertyValue(region, entry, 1, entry),
          ];
        }
      }
      const result = createEmptyObject(
        region,
        toPrototype(
          region,
          getInternalPropertyValue(region, new_target, "prototype", new_target),
        ),
      );
      weak_map_registry.$set(result, createSafeWeakMap(entries));
      return result;
    },
    apply: null,
  },
  "linvail.Map": {
    construct: (region, input, new_target) => {
      const { map_registry } = region;
      const argument0 = toMaybeInternalReferenceStrict(
        region,
        atInternal(region, input, 0),
      );
      /**
       * @type {[
       *   import("../domain.d.ts").Wrapper,
       *   import("../domain.d.ts").Wrapper,
       * ][]}
       */
      const entries = [];
      if (argument0 !== null) {
        const length = getLength(region, argument0);
        for (let index = 0; index < length; index++) {
          const entry = toInternalReferenceStrict(
            region,
            getInternalPropertyValue(region, argument0, index, argument0),
          );
          entries[index] = [
            getInternalPropertyValue(region, entry, 0, entry),
            getInternalPropertyValue(region, entry, 1, entry),
          ];
        }
      }
      const result = createEmptyObject(
        region,
        toPrototype(
          region,
          getInternalPropertyValue(region, new_target, "prototype", new_target),
        ),
      );
      map_registry.$set(result, createSafeMap(entries));
      return result;
    },
    apply: null,
  },
  "linvail.is": {
    construct: null,
    apply: (region, _that, input) =>
      wrapStandardPrimitive(
        region,
        atInternal(region, input, 0) === atInternal(region, input, 1),
      ),
  },
  "linvail.dir": {
    construct: null,
    apply: (region, _that, input) => {
      const { dir, "global.undefined": undefined } = region;
      dir(atInternal(region, input, 0));
      return wrapStandardPrimitive(region, undefined);
    },
  },
  // WeakSet //
  "linvail.WeakSet.prototype.has": {
    construct: null,
    apply: (region, that, input) => {
      const { weak_set_registry, "global.TypeError": TypeError } = region;
      return wrapStandardPrimitive(
        region,
        getWeakMapStrict(weak_set_registry, that, TypeError).$has(
          atInternal(region, input, 0),
        ),
      );
    },
  },
  "linvail.WeakSet.prototype.add": {
    construct: null,
    apply: (region, that, input) => {
      const { weak_set_registry, "global.TypeError": TypeError } = region;
      getWeakMapStrict(weak_set_registry, that, TypeError).$add(
        atInternal(region, input, 0),
      );
      return that;
    },
  },
  "linvail.WeakSet.prototype.delete": {
    construct: null,
    apply: (region, that, input) => {
      const { weak_set_registry, "global.TypeError": TypeError } = region;
      return wrapStandardPrimitive(
        region,
        getWeakMapStrict(weak_set_registry, that, TypeError).$delete(
          atInternal(region, input, 0),
        ),
      );
    },
  },
  // Set //
  "linvail.Set.prototype.has": {
    construct: null,
    apply: (region, that, input) => {
      const { set_registry, "global.TypeError": TypeError } = region;
      return wrapStandardPrimitive(
        region,
        getWeakMapStrict(set_registry, that, TypeError).$has(
          atInternal(region, input, 0),
        ),
      );
    },
  },
  "linvail.Set.prototype.add": {
    construct: null,
    apply: (region, that, input) => {
      const { set_registry, "global.TypeError": TypeError } = region;
      getWeakMapStrict(set_registry, that, TypeError).$add(
        atInternal(region, input, 0),
      );
      return that;
    },
  },
  "linvail.Set.prototype.delete": {
    construct: null,
    apply: (region, that, input) => {
      const { set_registry, "global.TypeError": TypeError } = region;
      return wrapStandardPrimitive(
        region,
        getWeakMapStrict(set_registry, that, TypeError).$delete(
          atInternal(region, input, 0),
        ),
      );
    },
  },
  "linvail.Set.prototype.clear": void_oracle, // no benefit
  "linvail.Set.prototype.getSize": void_oracle, // no benefit
  "linvail.Set.prototype.forEach": {
    construct: null,
    apply: (region, that, input) => {
      const { set_registry, "global.TypeError": TypeError } = region;
      const callback = toInternalReferenceStrict(
        region,
        atInternal(region, input, 0),
      );
      const this_arg = atInternal(region, input, 1);
      getWeakMapStrict(set_registry, that, TypeError).$forEach((val, key) => {
        applyInternal(region, callback, this_arg, [val, key, that]);
      });
      return that;
    },
  },
  // WeakMap //
  "linvail.WeakMap.prototype.has": {
    construct: null,
    apply: (region, that, input) => {
      const { weak_map_registry, "global.TypeError": TypeError } = region;
      return wrapStandardPrimitive(
        region,
        getWeakMapStrict(
          weak_map_registry,
          toInternalReferenceStrict(region, that),
          TypeError,
        ).$has(atInternal(region, input, 0)),
      );
    },
  },
  "linvail.WeakMap.prototype.get": {
    construct: null,
    apply: (region, that, input) => {
      const {
        weak_map_registry,
        "global.TypeError": TypeError,
        "global.undefined": undefined,
      } = region;
      return (
        getWeakMapStrict(weak_map_registry, that, TypeError).$get(
          atInternal(region, input, 0),
        ) ?? wrapStandardPrimitive(region, undefined)
      );
    },
  },
  "linvail.WeakMap.prototype.set": {
    construct: null,
    apply: (region, that, input) => {
      const { weak_map_registry, "global.TypeError": TypeError } = region;
      getWeakMapStrict(weak_map_registry, that, TypeError).$set(
        atInternal(region, input, 0),
        atInternal(region, input, 1),
      );
      return that;
    },
  },
  "linvail.WeakMap.prototype.delete": {
    construct: null,
    apply: (region, that, input) => {
      const { weak_map_registry, "global.TypeError": TypeError } = region;
      return wrapStandardPrimitive(
        region,
        getWeakMapStrict(weak_map_registry, that, TypeError).$delete(
          atInternal(region, input, 0),
        ),
      );
    },
  },
  // Map //
  "linvail.Map.prototype.has": {
    construct: null,
    apply: (region, that, input) => {
      const { map_registry, "global.TypeError": TypeError } = region;
      return wrapStandardPrimitive(
        region,
        getWeakMapStrict(map_registry, that, TypeError).$has(
          atInternal(region, input, 0),
        ),
      );
    },
  },
  "linvail.Map.prototype.get": {
    construct: null,
    apply: (region, that, input) => {
      const {
        map_registry,
        "global.TypeError": TypeError,
        "global.undefined": undefined,
      } = region;
      return (
        getWeakMapStrict(map_registry, that, TypeError).$get(
          atInternal(region, input, 0),
        ) ?? wrapStandardPrimitive(region, undefined)
      );
    },
  },
  "linvail.Map.prototype.set": {
    construct: null,
    apply: (region, that, input) => {
      const { map_registry, "global.TypeError": TypeError } = region;
      getWeakMapStrict(map_registry, that, TypeError).$set(
        atInternal(region, input, 0),
        atInternal(region, input, 1),
      );
      return that;
    },
  },
  "linvail.Map.prototype.delete": {
    construct: null,
    apply: (region, that, input) => {
      const { map_registry, "global.TypeError": TypeError } = region;
      return wrapStandardPrimitive(
        region,
        getWeakMapStrict(map_registry, that, TypeError).$delete(
          atInternal(region, input, 0),
        ),
      );
    },
  },
  "linvail.Map.prototype.clear": void_oracle, // no benefit
  "linvail.Map.prototype.getSize": void_oracle, // no benefit
  "linvail.Map.prototype.forEach": {
    construct: null,
    apply: (region, that, input) => {
      const { map_registry, "global.TypeError": TypeError } = region;
      const callback = toInternalReferenceStrict(
        region,
        atInternal(region, input, 0),
      );
      const this_arg = atInternal(region, input, 1);
      getWeakMapStrict(map_registry, that, TypeError).$forEach((val, key) => {
        applyInternal(region, callback, this_arg, [val, key, that]);
      });
      return that;
    },
  },
};
