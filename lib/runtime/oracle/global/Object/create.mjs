/** @type {import("../..").CompileOracleEntry} */
export default ({
  reflect: { get, ownKeys, defineProperty, getOwnPropertyDescriptor },
  global: {
    Error,
    TypeError,
    Object: { create },
  },
  convert: { atInternal, toInternalPrototype, toInternalDefineDescriptor },
  region: { isInternalPrimitive, leavePrimitive },
}) => [
  create,
  {
    apply: (_that, args) => {
      const prototype = toInternalPrototype(atInternal(args, 0));
      const properties = atInternal(args, 1);
      if (isInternalPrimitive(properties)) {
        const primitive = leavePrimitive(properties);
        if (primitive === null) {
          throw new TypeError("Cannot convert null to property record");
        } else {
          return create(prototype);
        }
      } else {
        const target = create(prototype);
        const keys = ownKeys(properties);
        const { length } = keys;
        for (let index = 0; index < length; index++) {
          const key = keys[index];
          const descriptor = getOwnPropertyDescriptor(properties, key);
          if (!descriptor) {
            throw new Error("missing descriptor");
          }
          if (descriptor.enumerable) {
            defineProperty(
              target,
              key,
              toInternalDefineDescriptor(get(properties, key, properties)),
            );
          }
        }
        return target;
      }
    },
    construct: null,
  },
];
