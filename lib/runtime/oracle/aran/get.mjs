import { toPropertyKey } from "../../domain.mjs";

/** @type {import("..").CompileOracleEntry} */
export default ({
  aran: { get: callee },
  reflect: { get },
  global: { Object, TypeError },
  convert: { atInternal, atExternal },
  region: { isInternalPrimitive, leavePrimitive, enterPlainExternalReference },
}) => {
  /**
   * @type {(
   *   value: import("../../domain").InternalValue,
   * ) => import("../../domain").InternalReference}
   */
  const toInternalReference = (value) => {
    if (isInternalPrimitive(value)) {
      const primitive = leavePrimitive(value);
      if (primitive == null) {
        throw new TypeError("Cannot convert null or undefined to object");
      } else {
        return enterPlainExternalReference(Object(primitive));
      }
    } else {
      return value;
    }
  };
  return [
    callee,
    {
      apply: (_that, args) => {
        const receiver = atInternal(args, 0);
        const target = toInternalReference(receiver);
        const key = toPropertyKey(atExternal(args, 1));
        return get(target, key, receiver);
      },
      construct: null,
    },
  ];
};
