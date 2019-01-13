
const Hold = require("../hold.js");

const Object = global.Object;
const Object_create = Object.create;
const Object_prototype = Object.prototype;
const Array_isArray = Array.isArray;
const Number = global.Number;
const Reflect_getOwnPropertyDescriptor = Reflect.getOwnPropertyDescriptor;
const Reflect_setPrototypeOf = Reflect.setPrototypeOf;
const Reflect_get = Reflect.get;

// exports.Get = ($value1, key2, access, membrane) => {
//   if ($value1 === null || $value1 === void 0)
//     throw new TypeError("Cannot convert undefined or null to object");
//   const $object1 = (
//     typeof $value1 === "object" || typeof $value1 === "function" ?
//     $value1 :
//     access.capture(Object($value1)));
//   if (Array_isArray($object1) && key2 === "length")
//     return membrane.enter($object1.length);
//   if (Hold($object1, key2)) {
//     const $$value1 = membrane.taint($value1);
//     return Reflect_get($object1, key2, $$value1);
//   }
//   return membrane.taint(void 0);
// };
// 
// exports.Set = ($value1, key2, $$value3, access, membrane) => {
//   if ($value1 === null || $value1 === void 0)
//     throw new TypeError("Cannot convert undefined or null to object");
//   const $object1 = (
//     typeof $value1 === "object" || typeof $value1 === "function" ?
//     $value1 :
//     access.capture(Object($value1)));
//   if (Array_isArray($object1) && key2 === "length") {
//     $object1.length = access.release(membrane.leave($$object1));
//   } else  if (Hold($value1, key2)) {
//     const $$value1 = membrane.taint($value1);
//     Reflect_set($object1, key2, $$value3, $$value1);
//   } else {
//     Reflect_set($object1, key2, $$value3, $object1);
//   }
//   return $$value3;
// };
// 
// exports.SetStrict = ($value1, key2, $$value3, access) => {
//   if ($value1 === null || $value1 === void 0)
//     throw new TypeError("Cannot convert undefined or null to object");
//   if (typeof $value1 !== "object" && typeof $value1 !== "function")
//     throw new TypeError("Cannot assign proprerty of primitive value");
//   const $object1 = $value1;
//   if (Array_isArray($object1) && key2 === "length") {
//     $object1.length = access.release(membrane.leave($$object1));
//   } else  if (Hold($value1, key2)) {
//     const $$value1 = membrane.taint($value1);
//     if (!Reflect_set($object1, key2, $$value3, $$value1)) {
//       throw new TypeError("Cannot assign object property");
//     }
//   } else {
//     if (!Reflect_set($object1, key2, $$value3, $object1)) {
//       throw new TypeError("Cannot assign object property");
//     }
//   }
//   return $$value3;
// };

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
  if (!Hold($object, "length"))
    return 0;
  $$value = Reflect_get($object, "length", $$value);
  const $value = membrane.clean($$value);
  const value = access.release($value);
  const number = Number(value);
  return number !== number ? 0 : number;
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
  const $descriptor = Object_create(null);
  const $$value = membrane.taint($value);
  if (Hold($value, "value")) {
    if (boolean) {
      $descriptor.value = access.release(membrane.clean(Reflect_get($value, "value", $$value)))
    } else {
      $descriptor.value =  Reflect_get($value, "value", $$value);
    }
  }
  if (Hold($value, "writable"))
    $descriptor.writable = membrane.clean(Reflect_get($value, "writable", $$value));
  if (Hold($value, "get"))
    $descriptor.get = membrane.clean(Reflect_get($value, "get", $$value));
  if (Hold($value, "set"))
    $descriptor.set = membrane.clean(Reflect_get($value, "set", $$value));
  if (Hold($value, "enumerable"))
    $descriptor.enumerable = membrane.clean(Reflect_get($value, "enumerable", $$value));
  if (Hold($value, "configurable"))
    $descriptor.configurable = membrane.clean(Reflect_get($value, "configurable", $$value));
  return $descriptor;
};

exports.TameValueToTameArguments = ($value, access, membrane) => {
  if ($value === null || (typeof $value !== "object" && typeof $value !== "function"))
    throw new TypeError("CreateListFromArrayLike called on non-object");
  let length;
  if (Array_isArray($value)) {
    length = $value.length;
  } else if (Hold($value, "length")) {
    const $$value = Reflect_get($value, "length", $$value);
    length = Number(access.release(membrane.clean($value.length)));
  } else {
    length = 0;
  }
  const $arguments = Object_create(null);
  $arguments.length = length;
  for (let index = 0; index < length; index++)
    $arguments[index] = Hold($value, index) ? $value[index] : membrane.taint(void 0);
  return $arguments;
};
