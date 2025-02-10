import { LinvailExecError } from "../../error.mjs";
import {
  atInternal,
  toInternalDefineDescriptor,
  toInternalPrototype,
} from "../convert.mjs";
import { isDataDescriptor } from "../domain.mjs";
import {
  applyInternal,
  defineInternalProperty,
  getInternalProperty,
  listInternalProperty,
} from "../reflect.mjs";
import {
  enterPrimitive,
  isInternalPrimitive,
  leavePrimitive,
} from "../region/core.mjs";

/** @type {import("../oracle").ApplyOracleMapping} */
export const object_apply_oracle_mapping = {
  "global.Object.create": (region, _that, args) => {
    const {
      "global.undefined": undefined,
      "global.TypeError": TypeError,
      "global.Object.create": createObject,
    } = region;
    const prototype = toInternalPrototype(region, atInternal(region, args, 0));
    const properties = atInternal(region, args, 1);
    if (isInternalPrimitive(region, properties)) {
      const primitive = leavePrimitive(region, properties);
      if (primitive === null) {
        throw new TypeError("Cannot convert null to property record");
      } else {
        return createObject(prototype);
      }
    } else {
      const target = createObject(prototype);
      const keys = listInternalProperty(region, properties);
      const { length } = keys;
      for (let index = 0; index < length; index++) {
        const key = keys[index];
        const descriptor = getInternalProperty(region, properties, key);
        if (!descriptor) {
          throw new LinvailExecError("Missing descriptor", {
            key,
            properties,
          });
        }
        if (descriptor.enumerable) {
          defineInternalProperty(
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
};
