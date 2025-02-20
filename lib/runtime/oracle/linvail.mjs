import {
  addSet,
  addWeakSet,
  createMap,
  createSet,
  createWeakMap,
  createWeakSet,
  deleteMap,
  deleteSet,
  deleteWeakMap,
  deleteWeakSet,
  forEachMap,
  forEachSet,
  getMap,
  getWeakMap,
  hasMap,
  hasSet,
  hasWeakMap,
  hasWeakSet,
  setMap,
  setWeakMap,
} from "../../util/collection.mjs";
import { applyInternal, getInternalPropertyValue } from "../reflect.mjs";
import { enterPrimitive } from "../region/core.mjs";
import {
  atInternal,
  getLength,
  toInternalReferenceStrict,
  toMaybeInternalReferenceStrict,
} from "./helper.mjs";

/**
 * @type {<K extends object, V extends object>(
 *   weakmap: import("../../util/collection").WeakMap<K, V>,
 *   key: K,
 *   Error: new (message: string) => Error,
 * ) => V}
 */
const getWeakMapStrict = (weakmap, key, Error) => {
  const result = getWeakMap(weakmap, key);
  if (!result) {
    throw new Error("Incompatible receiver");
  }
  return result;
};

/**
 * @type {Record<
 *   `linvail.${"Map" | "Set" | "WeakMap" | "WeakSet"}`,
 *   import("../oracle").ConstructOracle
 * >}
 */
export const linvail_construct_oracle_mapping = {
  "linvail.WeakSet": (region, input, new_target) => {
    const { "global.Object.create": createObject } = region;
    const { weak_set_registery } = region;
    const argument0 = toMaybeInternalReferenceStrict(
      region,
      atInternal(region, input, 0),
    );
    /**
     * @type {import("../domain").InternalValue[]}
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
    const result = createObject(
      toMaybeInternalReferenceStrict(
        region,
        getInternalPropertyValue(region, new_target, "prototype", new_target),
      ),
    );
    setWeakMap(weak_set_registery, result, createWeakSet(keys));
    return result;
  },
  "linvail.Set": (region, input, new_target) => {
    const { "global.Object.create": createObject } = region;
    const { set_registery } = region;
    const argument0 = toMaybeInternalReferenceStrict(
      region,
      atInternal(region, input, 0),
    );
    /**
     * @type {import("../domain").InternalValue[]}
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
    const result = createObject(
      toMaybeInternalReferenceStrict(
        region,
        getInternalPropertyValue(region, new_target, "prototype", new_target),
      ),
    );
    setWeakMap(set_registery, result, createSet(keys));
    return result;
  },
  "linvail.WeakMap": (region, input, new_target) => {
    const { "global.Object.create": createObject } = region;
    const { weak_map_registery } = region;
    const argument0 = toMaybeInternalReferenceStrict(
      region,
      atInternal(region, input, 0),
    );
    /**
     * @type {[
     *   import("../domain").InternalValue,
     *   import("../domain").InternalValue,
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
    const result = createObject(
      toMaybeInternalReferenceStrict(
        region,
        getInternalPropertyValue(region, new_target, "prototype", new_target),
      ),
    );
    setWeakMap(weak_map_registery, result, createWeakMap(entries));
    return result;
  },
  "linvail.Map": (region, input, new_target) => {
    const { "global.Object.create": createObject } = region;
    const { map_registery } = region;
    const argument0 = toMaybeInternalReferenceStrict(
      region,
      atInternal(region, input, 0),
    );
    /**
     * @type {[
     *   import("../domain").InternalValue,
     *   import("../domain").InternalValue,
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
    const result = createObject(
      toMaybeInternalReferenceStrict(
        region,
        getInternalPropertyValue(region, new_target, "prototype", new_target),
      ),
    );
    setWeakMap(map_registery, result, createMap(entries));
    return result;
  },
};

/**
 * @type {Record<
 *   (
 *     | `linvail.${"is" | "dir"}`
 *     | `linvail.Map.prototype.${keyof import("../library").LinvailMapPrototype}`
 *     | `linvail.Set.prototype.${keyof import("../library").LinvailSetPrototype}`
 *     | `linvail.WeakMap.prototype.${keyof import("../library").LinvailWeakMapPrototype}`
 *     | `linvail.WeakSet.prototype.${keyof import("../library").LinvailWeakSetPrototype}`
 *   ),
 *   null | import("../oracle").ApplyOracle
 * >}
 */
export const linvail_apply_oracle_mapping = {
  "linvail.is": (region, _that, input) =>
    enterPrimitive(
      region,
      atInternal(region, input, 0) === atInternal(region, input, 1),
    ),
  "linvail.dir": (region, _that, input) => {
    const { dir, "global.undefined": undefined } = region;
    dir(atInternal(region, input, 0));
    return enterPrimitive(region, undefined);
  },
  // WeakSet //
  "linvail.WeakSet.prototype.has": (region, that, input) => {
    const { weak_set_registery, "global.TypeError": TypeError } = region;
    return enterPrimitive(
      region,
      hasWeakSet(
        getWeakMapStrict(weak_set_registery, that, TypeError),
        atInternal(region, input, 0),
      ),
    );
  },
  "linvail.WeakSet.prototype.add": (region, that, input) => {
    const { weak_set_registery, "global.TypeError": TypeError } = region;
    addWeakSet(
      getWeakMapStrict(weak_set_registery, that, TypeError),
      atInternal(region, input, 0),
    );
    return that;
  },
  "linvail.WeakSet.prototype.delete": (region, that, input) => {
    const { weak_set_registery, "global.TypeError": TypeError } = region;
    return enterPrimitive(
      region,
      deleteWeakSet(
        getWeakMapStrict(weak_set_registery, that, TypeError),
        atInternal(region, input, 0),
      ),
    );
  },
  // Set //
  "linvail.Set.prototype.has": (region, that, input) => {
    const { set_registery, "global.TypeError": TypeError } = region;
    return enterPrimitive(
      region,
      hasSet(
        getWeakMapStrict(set_registery, that, TypeError),
        atInternal(region, input, 0),
      ),
    );
  },
  "linvail.Set.prototype.add": (region, that, input) => {
    const { set_registery, "global.TypeError": TypeError } = region;
    addSet(
      getWeakMapStrict(set_registery, that, TypeError),
      atInternal(region, input, 0),
    );
    return that;
  },
  "linvail.Set.prototype.delete": (region, that, input) => {
    const { set_registery, "global.TypeError": TypeError } = region;
    return enterPrimitive(
      region,
      deleteSet(
        getWeakMapStrict(set_registery, that, TypeError),
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
    forEachSet(
      getWeakMapStrict(set_registery, that, TypeError),
      (val, key) => {
        applyInternal(region, callback, this_arg, [val, key, that]);
      },
      null,
    );
    return that;
  },
  // WeakMap //
  "linvail.WeakMap.prototype.has": (region, that, input) => {
    const { weak_map_registery, "global.TypeError": TypeError } = region;
    return enterPrimitive(
      region,
      hasWeakMap(
        getWeakMapStrict(
          weak_map_registery,
          toInternalReferenceStrict(region, that),
          TypeError,
        ),
        atInternal(region, input, 0),
      ),
    );
  },
  "linvail.WeakMap.prototype.get": (region, that, input) => {
    const {
      weak_map_registery,
      "global.TypeError": TypeError,
      "global.undefined": undefined,
    } = region;
    return (
      getWeakMap(
        getWeakMapStrict(weak_map_registery, that, TypeError),
        atInternal(region, input, 0),
      ) ?? enterPrimitive(region, undefined)
    );
  },
  "linvail.WeakMap.prototype.set": (region, that, input) => {
    const { weak_map_registery, "global.TypeError": TypeError } = region;
    setWeakMap(
      getWeakMapStrict(weak_map_registery, that, TypeError),
      atInternal(region, input, 0),
      atInternal(region, input, 1),
    );
    return that;
  },
  "linvail.WeakMap.prototype.delete": (region, that, input) => {
    const { weak_map_registery, "global.TypeError": TypeError } = region;
    return enterPrimitive(
      region,
      deleteWeakMap(
        getWeakMapStrict(weak_map_registery, that, TypeError),
        atInternal(region, input, 0),
      ),
    );
  },
  // Map //
  "linvail.Map.prototype.has": (region, that, input) => {
    const { map_registery, "global.TypeError": TypeError } = region;
    return enterPrimitive(
      region,
      hasMap(
        getWeakMapStrict(map_registery, that, TypeError),
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
      getMap(
        getWeakMapStrict(map_registery, that, TypeError),
        atInternal(region, input, 0),
      ) ?? enterPrimitive(region, undefined)
    );
  },
  "linvail.Map.prototype.set": (region, that, input) => {
    const { map_registery, "global.TypeError": TypeError } = region;
    setMap(
      getWeakMapStrict(map_registery, that, TypeError),
      atInternal(region, input, 0),
      atInternal(region, input, 1),
    );
    return that;
  },
  "linvail.Map.prototype.delete": (region, that, input) => {
    const { map_registery, "global.TypeError": TypeError } = region;
    return enterPrimitive(
      region,
      deleteMap(
        getWeakMapStrict(map_registery, that, TypeError),
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
    forEachMap(
      getWeakMapStrict(map_registery, that, TypeError),
      (val, key) => {
        applyInternal(region, callback, this_arg, [val, key, that]);
      },
      null,
    );
    return that;
  },
};
