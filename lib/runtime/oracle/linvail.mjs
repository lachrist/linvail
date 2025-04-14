import {
  createSafeMap,
  createSafeSet,
  createSafeWeakMap,
  createSafeWeakSet,
} from "../../util/collection.mjs";
import { applyInternal, getInternalPropertyValue } from "../reflect.mjs";
import { createEmptyObject, wrapStandardPrimitive } from "../region/core.mjs";
import {
  atInternal,
  getLength,
  toInternalReferenceStrict,
  toMaybeInternalReferenceStrict,
  toPrototype,
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
 *   `linvail.${"Map" | "Set" | "WeakMap" | "WeakSet"}`,
 *   import("../oracle.d.ts").ConstructOracle
 * >}
 */
export const linvail_construct_oracle_mapping = {
  "linvail.WeakSet": (region, input, new_target) => {
    const { weak_set_registery } = region;
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
    weak_set_registery.$set(result, createSafeWeakSet(keys));
    return result;
  },
  "linvail.Set": (region, input, new_target) => {
    const { set_registery } = region;
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
    set_registery.$set(result, createSafeSet(keys));
    return result;
  },
  "linvail.WeakMap": (region, input, new_target) => {
    const { weak_map_registery } = region;
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
    weak_map_registery.$set(result, createSafeWeakMap(entries));
    return result;
  },
  "linvail.Map": (region, input, new_target) => {
    const { map_registery } = region;
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
    map_registery.$set(result, createSafeMap(entries));
    return result;
  },
};

/**
 * @type {Record<
 *   (
 *     | `linvail.${"is" | "dir" | "getKind"}`
 *     | `linvail.Map.prototype.${keyof import("../../library/library.d.ts").LinvailMapPrototype}`
 *     | `linvail.Set.prototype.${keyof import("../../library/library.d.ts").LinvailSetPrototype}`
 *     | `linvail.WeakMap.prototype.${keyof import("../../library/library.d.ts").LinvailWeakMapPrototype}`
 *     | `linvail.WeakSet.prototype.${keyof import("../../library/library.d.ts").LinvailWeakSetPrototype}`
 *   ),
 *   null | import("../oracle.d.ts").ApplyOracle
 * >}
 */
export const linvail_apply_oracle_mapping = {
  "linvail.is": (region, _that, input) =>
    wrapStandardPrimitive(
      region,
      atInternal(region, input, 0) === atInternal(region, input, 1),
    ),
  "linvail.dir": (region, _that, input) => {
    const { dir, "global.undefined": undefined } = region;
    dir(atInternal(region, input, 0));
    return wrapStandardPrimitive(region, undefined);
  },
  "linvail.getKind": (region, _that, input) =>
    wrapStandardPrimitive(region, atInternal(region, input, 0).type),
  // WeakSet //
  "linvail.WeakSet.prototype.has": (region, that, input) => {
    const { weak_set_registery, "global.TypeError": TypeError } = region;
    return wrapStandardPrimitive(
      region,
      getWeakMapStrict(weak_set_registery, that, TypeError).$has(
        atInternal(region, input, 0),
      ),
    );
  },
  "linvail.WeakSet.prototype.add": (region, that, input) => {
    const { weak_set_registery, "global.TypeError": TypeError } = region;
    getWeakMapStrict(weak_set_registery, that, TypeError).$add(
      atInternal(region, input, 0),
    );
    return that;
  },
  "linvail.WeakSet.prototype.delete": (region, that, input) => {
    const { weak_set_registery, "global.TypeError": TypeError } = region;
    return wrapStandardPrimitive(
      region,
      getWeakMapStrict(weak_set_registery, that, TypeError).$delete(
        atInternal(region, input, 0),
      ),
    );
  },
  // Set //
  "linvail.Set.prototype.has": (region, that, input) => {
    const { set_registery, "global.TypeError": TypeError } = region;
    return wrapStandardPrimitive(
      region,
      getWeakMapStrict(set_registery, that, TypeError).$has(
        atInternal(region, input, 0),
      ),
    );
  },
  "linvail.Set.prototype.add": (region, that, input) => {
    const { set_registery, "global.TypeError": TypeError } = region;
    getWeakMapStrict(set_registery, that, TypeError).$add(
      atInternal(region, input, 0),
    );
    return that;
  },
  "linvail.Set.prototype.delete": (region, that, input) => {
    const { set_registery, "global.TypeError": TypeError } = region;
    return wrapStandardPrimitive(
      region,
      getWeakMapStrict(set_registery, that, TypeError).$delete(
        atInternal(region, input, 0),
      ),
    );
  },
  "linvail.Set.prototype.clear": null, // no benefit
  "linvail.Set.prototype.getSize": null, // no benefit
  "linvail.Set.prototype.forEach": (region, that, input) => {
    const { set_registery, "global.TypeError": TypeError } = region;
    const callback = toInternalReferenceStrict(
      region,
      atInternal(region, input, 0),
    );
    const this_arg = atInternal(region, input, 1);
    getWeakMapStrict(set_registery, that, TypeError).$forEach((val, key) => {
      applyInternal(region, callback, this_arg, [val, key, that]);
    });
    return that;
  },
  // WeakMap //
  "linvail.WeakMap.prototype.has": (region, that, input) => {
    const { weak_map_registery, "global.TypeError": TypeError } = region;
    return wrapStandardPrimitive(
      region,
      getWeakMapStrict(
        weak_map_registery,
        toInternalReferenceStrict(region, that),
        TypeError,
      ).$has(atInternal(region, input, 0)),
    );
  },
  "linvail.WeakMap.prototype.get": (region, that, input) => {
    const {
      weak_map_registery,
      "global.TypeError": TypeError,
      "global.undefined": undefined,
    } = region;
    return (
      getWeakMapStrict(weak_map_registery, that, TypeError).$get(
        atInternal(region, input, 0),
      ) ?? wrapStandardPrimitive(region, undefined)
    );
  },
  "linvail.WeakMap.prototype.set": (region, that, input) => {
    const { weak_map_registery, "global.TypeError": TypeError } = region;
    getWeakMapStrict(weak_map_registery, that, TypeError).$set(
      atInternal(region, input, 0),
      atInternal(region, input, 1),
    );
    return that;
  },
  "linvail.WeakMap.prototype.delete": (region, that, input) => {
    const { weak_map_registery, "global.TypeError": TypeError } = region;
    return wrapStandardPrimitive(
      region,
      getWeakMapStrict(weak_map_registery, that, TypeError).$delete(
        atInternal(region, input, 0),
      ),
    );
  },
  // Map //
  "linvail.Map.prototype.has": (region, that, input) => {
    const { map_registery, "global.TypeError": TypeError } = region;
    return wrapStandardPrimitive(
      region,
      getWeakMapStrict(map_registery, that, TypeError).$has(
        atInternal(region, input, 0),
      ),
    );
  },
  "linvail.Map.prototype.get": (region, that, input) => {
    const {
      map_registery,
      "global.TypeError": TypeError,
      "global.undefined": undefined,
    } = region;
    return (
      getWeakMapStrict(map_registery, that, TypeError).$get(
        atInternal(region, input, 0),
      ) ?? wrapStandardPrimitive(region, undefined)
    );
  },
  "linvail.Map.prototype.set": (region, that, input) => {
    const { map_registery, "global.TypeError": TypeError } = region;
    getWeakMapStrict(map_registery, that, TypeError).$set(
      atInternal(region, input, 0),
      atInternal(region, input, 1),
    );
    return that;
  },
  "linvail.Map.prototype.delete": (region, that, input) => {
    const { map_registery, "global.TypeError": TypeError } = region;
    return wrapStandardPrimitive(
      region,
      getWeakMapStrict(map_registery, that, TypeError).$delete(
        atInternal(region, input, 0),
      ),
    );
  },
  "linvail.Map.prototype.clear": null, // no benefit
  "linvail.Map.prototype.getSize": null, // no benefit
  "linvail.Map.prototype.forEach": (region, that, input) => {
    const { map_registery, "global.TypeError": TypeError } = region;
    const callback = toInternalReferenceStrict(
      region,
      atInternal(region, input, 0),
    );
    const this_arg = atInternal(region, input, 1);
    getWeakMapStrict(map_registery, that, TypeError).$forEach((val, key) => {
      applyInternal(region, callback, this_arg, [val, key, that]);
    });
    return that;
  },
};
