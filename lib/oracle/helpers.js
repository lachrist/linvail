
const Object = global.Object;
const Object_create = Object.create;
const Object_prototype = Object.prototype;
const Array_isArray = Array.isArray;
const Number = global.Number;
const Reflect_getOwnPropertyDescriptor = Reflect.getOwnPropertyDescriptor;
const Reflect_setPrototypeOf = Reflect.setPrototypeOf;
const Reflect_getPrototypeOf = Reflect.getPrototypeOf;
const Reflect_get = Reflect.get;
const Reflect_apply = Reflect.apply;
const Reflect_set = Reflect.set;
const Reflect_defineProperty = Reflect.defineProperty;

const has = (object, key) => {
  while (object) {
    if (Reflect_getOwnPropertyDescriptor(object, key))
      return true;
    object = Reflect_getPrototypeOf(object);
  }
  return false;
};

const set = ($value0, value1, $$value2, $$value3, access, membrane) => {
  if ($value0 === null || (typeof $value0 !== "object" && typeof $value0 !== "function"))
    throw new TypeError("Reflect.set called on non-object");
  while ($value0) {
    const $descriptor = Reflect_getOwnPropertyDescriptor($value0, value1);
    if ($descriptor) {
      if (Reflect_getOwnPropertyDescriptor($descriptor, "value")) {
        if (!$descriptor.writable)
          return false;
        break;
      }
      if ($descriptor.set) {
        Reflect_apply($descriptor.set, $$value3, [$$value2]);
        return true;
      }
      return false;
    }
    $value0 = Reflect_getPrototypeOf($value0);
  }
  const $value3 = membrane.clean($$value3);
  let $descriptor = Reflect_getOwnPropertyDescriptor($value3, value1);
  if ($descriptor && !Reflect_getOwnPropertyDescriptor($descriptor, "value"))
    return false;
  if (!$descriptor) {
    $descriptor = Object_create(null);
    $descriptor.writable = true;
    $descriptor.enumerable = true;
    $descriptor.configurable = true;
  }
  if (Array_isArray($value3) && String(value1) === "length")
    $descriptor.value = access.release(membrane.clean($$value2));
  else
    $descriptor.value = $$value2;
  return Reflect_defineProperty($value3, value1, $descriptor);
};

const get = ($value0, value1, $$value2, access, membrane) => {
  if ($value0 === null || (typeof $value0 !== "object" && typeof $value0 !== "function"))
    throw new TypeError("Reflect.get called on non-object");
  while ($value0) {
    if (Array_isArray($value0) && String(value1) === "length")
      return membrane.taint($value0.length);
    const $descriptor = Reflect_getOwnPropertyDescriptor($value0, value1);
    if ($descriptor) {
      if (Reflect_getOwnPropertyDescriptor($descriptor, "value"))
        return $descriptor.value;
      if ($descriptor.get)
        return Reflect_apply($descriptor.get, $$value2, []);
      return membrane.taint(void 0);
    }
    $value0 = Reflect_getPrototypeOf($value0);
  }
  return membrane.taint(void 0);
};

exports.Get = get;

exports.Set = set;

exports.TameValueToTameObject = ($value, message, access, membrane) => {
  if ($value === null || $value === void 0)
    throw new TypeError(message || "Cannot convert undefined or null to an object");
  if (typeof $value === "object" || typeof $value === "function")
    return $value;
  if (message)
    throw new TypeError(message);
  return access.capture(Object($value));
};

exports.TameDescriptorToTameValue = (boolean, $descriptor, access, membrane) => {
  if ($descriptor === void 0)
    return void 0;
  const $object = Object_create(null);
  if (Reflect_getOwnPropertyDescriptor($descriptor, "value")) {
    $object.value = boolean ? membrane.taint(access.capture($descriptor.value)) : $descriptor.value;
    $object.writable = membrane.taint($descriptor.writable);
  } else {
    $object.get = membrane.taint($descriptor.get);
    $object.set = membrane.taint($descriptor.set);
  }
  $object.enumerable = membrane.taint($descriptor.enumerable);
  $object.configurable = membrane.taint($descriptor.configurable);
  Reflect_setPrototypeOf($object, access.capture(Object_prototype));
  return $object;
};

exports.TameValueToTameDescriptor = (boolean, $value, access, membrane) => {
  if ($value === null || (typeof $value !== "object" && typeof $value !== "function"))
    throw new TypeError("Property description must be an object");
  const value = access.release($value);
  const $$value = membrane.taint($value);
  const $descriptor = Object_create(null);
  if (has($value, "value")) {
    $descriptor.value = get($value, "value", $$value, access, membrane);
    if (boolean) {
      $descriptor.value = access.release(membrane.clean($descriptor.value));
    }
  }
  if (has($value, "writable"))
    $descriptor.writable = value.writable;
  if (has($value, "get"))
    $descriptor.get = access.capture(value.get);
  if (has($value, "set"))
    $descriptor.set = access.capture(value.set);
  if (has($value, "enumerable"))
    $descriptor.enumerable = value.enumerable;
  if (has($value, "configurable"))
    $descriptor.configurable = value.configurable;
  return $descriptor;
};

exports.TameValueToTameArguments = ($value, access, membrane) => {
  if ($value === null || (typeof $value !== "object" && typeof $value !== "function"))
    throw new TypeError("CreateListFromArrayLike called on non-object");
  const $$value = membrane.taint($value);
  const value = access.release($value);
  const $arguments = Object_create(null);
  $arguments.length = value.length;
  for (let index = 0; index < $arguments.length; index++)
    $arguments[index] = get($value, index, $$value, access, membrane);
  return $arguments;
};
