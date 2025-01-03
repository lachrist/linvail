/** @type {import("../../oracle").CompileOracleEntry} */
export default ({
  apply,
  global: {
    undefined,
    TypeError,
    Object: { create },
    Reflect: { ownKeys, getOwnPropertyDescriptor },
  },
  region: {
    isInternalPrimitive,
    leavePrimitive,
    atInternal,
    toInternalPrototype,
    isGuestInternalReference,
    leavePlainExternalReference,
    enterPlainExternalReference,
    enterPrimitive,
  },
}) => [
  create,
  {
    apply: (_that, args) => {
      const prototype = toInternalPrototype(atInternal(args, 0));
      const raw_property_record = atInternal(args, 1);
      if (isInternalPrimitive(raw_property_record)) {
        const primitive = leavePrimitive(raw_property_record);
        if (primitive === null) {
          throw new TypeError("Cannot convert null to property record");
        } else {
          return create(prototype);
        }
      } else {
        const target = create(prototype);
        const keys = isGuestInternalReference(raw_property_record)
          ? ownKeys(leavePlainExternalReference(raw_property_record))
          : ownKeys(raw_property_record);
        const { length } = keys;
        for (let index = 0; index < length; index++) {
          const key = keys[index];
          const raw_descriptor = apply(
            enterPlainExternalReference(get),
            enterPrimitive(undefined),
            [raw_property_record, enterPrimitive(key)],
          );
          const descriptor = { __proto__: null };
        }

        if (isGuestInternalReference(raw_property_record)) {
          const external = leavePlainExternalReference(raw_property_record);
          const keys = ownKeys(external);
          for (const key of keys) {
            const descriptor = get(external, key);
            if (!descriptor) {
              throw new Error("missing descriptor");
            }
            defineProperty(target, key, descriptor);
          }
          return create(prototype);
        } else {
          const keys = ownKeys(raw_property_record);
        }
      }
    },
    construct: null,
  },
];
