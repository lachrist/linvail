
const Object = global.Object;
const Object_create = Object.create;
const Object_prototype = Object.prototype;
const Array_isArray = Array.isArray;
const Number = global.Number;
const Reflect_getOwnPropertyDescriptor = Reflect.getOwnPropertyDescriptor;
const Reflect_getPrototypeOf = Reflect.getPrototypeOf;
const Reflect_setPrototypeOf = Reflect.setPrototypeOf;
const Reflect_get = Reflect.get;

const hold = (object, key) => {
  while (object) {
    if (Reflect_getOwnPropertyDescriptor(object, key))
      return true;
    object = Reflect_getPrototypeOf(object);
  }
  return false;
};

exports.hold = hold;

exports.TameValueToTameObject = ($value, message, access, membrane) => {
  if ($value === null || $value === void 0)
    throw new TypeError(message || "Cannot convert undefined or null to an object");
  if (typeof $value === "object" || typeof $value === "function")
    return $value;
  if (message)
    throw new TypeError(message);
  return access.capture(Object($value));
};

exports.TameObjectToLength = ($object, $$value, access, membrane) => {
  if (Array_isArray($object))
    return $object.length;
  if (!hold($object, "length"))
    return 0;
  $$value = Reflect_get($object, "length", $$value);
  const $value = membrane.leave($$value);
  const value = access.release($value);
  const number = Number(value);
  return number !== number ? 0 : number;
};

exports.TameDescriptorToTameValue = (boolean, $descriptor, access, membrane) => {
  if ($descriptor === void 0)
    return void 0;
  const $object = Object_create(null);
  if (Reflect_getOwnPropertyDescriptor($descriptor, "value")) {
    $object.value = boolean ? membrane.enter(access.capture($descriptor.value)) : $descriptor.value;
    $object.writable = membrane.enter($descriptor.writable);
  } else {
    $object.get = membrane.enter($descriptor.get);
    $object.set = membrane.enter($descriptor.set);
  }
  $object.enumerable = membrane.enter($descriptor.enumerable);
  $object.configurable = membrane.enter($descriptor.configurable);
  Reflect_setPrototypeOf($object, access.capture(Object_prototype));
  return $object;
};

exports.TameValueToTameDescriptor = (boolean, $value, access, membrane) => {
  if ($value === null || (typeof $value !== "object" && typeof $value !== "function"))
    throw new TypeError("Property description must be an object");
  const $descriptor = Object_create(null);
  if (hold($value, "value"))
    $descriptor.value = boolean ? access.release(membrane.leave($value.value)) : $value.value;
  if (hold($value, "writable"))
    $descriptor.writable = membrane.leave($value.writable);
  if (hold($value, "get"))
    $descriptor.get = membrane.leave($value.get);
  if (hold($value, "set"))
    $descriptor.set = membrane.leave($value.set);
  if (hold($value, "enumerable"))
    $descriptor.enumerable = membrane.leave($value.enumerable);
  if (hold($value, "configurable"))
    $descriptor.configurable = membrane.leave($value.configurable);
  return $descriptor;
};

exports.TameValueToTameArguments = ($value, access, membrane) => {
  if ($value === null || (typeof $value !== "object" && typeof $value !== "function"))
    throw new TypeError("CreateListFromArrayLike called on non-object");
  let length;
  if (Array_isArray($value)) {
    length = $value.length;
  } else if (hold($value, "length")) {
    length = Number(access.release(membrane.leave($value.length)));
  } else {
    length = 0;
  }
  const $arguments = Object_create(null);
  $arguments.length = length;
  for (let index = 0; index < length; index++)
    $arguments[index] = hold($value, index) ? $value[index] : membrane.enter(void 0);
  return $arguments;
};
