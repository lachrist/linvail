import { LinvailExecError } from "../../error.mjs";
import {
  atInternal,
  toInternalDefineDescriptor,
  toInternalPrototype,
  toInternalReferenceSloppy,
} from "../convert.mjs";
import { isDataDescriptor } from "../domain.mjs";
import {
  applyInternal,
  defineInternalPropertyDescriptor,
  getInternalOwnPropertyDescriptor,
  listInternalOwnPropertyKey,
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
};
