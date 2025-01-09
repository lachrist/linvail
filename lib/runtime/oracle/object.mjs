import { LinvailExecError } from "../../error.mjs";
import {
  atInternal,
  toInternalDefineDescriptor,
  toInternalPrototype,
} from "../convert.mjs";
import {
  defineInternalProperty,
  getInternal,
  getInternalProperty,
  listInternalProperty,
} from "../reflect.mjs";
import { isInternalPrimitive, leavePrimitive } from "../region/core.mjs";

/** @type {import("../oracle").ApplyOracleMapping} */
export const object_apply_oracle_mapping = {
  "Object.create": (region, _that, args) => {
    const {
      global: {
        TypeError,
        Object: { create },
      },
    } = region;
    const prototype = toInternalPrototype(region, atInternal(region, args, 0));
    const properties = atInternal(region, args, 1);
    if (isInternalPrimitive(region, properties)) {
      const primitive = leavePrimitive(region, properties);
      if (primitive === null) {
        throw new TypeError("Cannot convert null to property record");
      } else {
        return create(prototype);
      }
    } else {
      const target = create(prototype);
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
              getInternal(region, properties, key, properties),
            ),
          );
        }
      }
      return target;
    }
  },
};
