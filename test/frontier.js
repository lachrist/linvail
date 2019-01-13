
module.exports = ({membrane, access, assert}) => {

  { // Apply
    const primitive1 = "foo";
    const primitive2 = "bar";
    const primitive3 = "foo";
    const $closure4 = function () {
      assert(membrane.clean(this) === primitive1)
      assert(arguments.length === 1);
      assert(membrane.clean(arguments[0]) === primitive2);
      return membrane.taint(primitive3);
    };
    const closure4 = access.release($closure4);
    const value5 = Reflect.apply(closure4, primitive1, [primitive2]);
    assert(value5 === primitive3);
  }

  { // Construct
    const closure1 = function () {};
    const $closure1 = access.capture(closure1);
    const primitive2 = "foo";
    const $$primitive2 = membrane.taint(primitive2);
    const object3 = Object.create(null);
    const closure4 = function () {
      assert(new.target === closure1);
      assert(Reflect.getPrototypeOf(this), closure1.prototype);
      assert(arguments.length === 1);
      assert(arguments[0] === primitive2);
      return object3;
    };
    const $closure4 = access.capture(closure4);
    const $$object5 = Reflect.construct($closure4, [$$primitive2], $closure1);
    const $object5 = membrane.clean($$object5);
    const object5 = access.release($object5);
    assert(object5 === object3);
  }

  { // Get/Set/Has: Direct data property
    const object1 = Object.create(null);
    const $object1 = access.capture(object1);
    const string2 = "foo";
    const value3 = 123;
    const $$value3 = membrane.taint(value3);
    const boolean4 = Reflect.set($object1, string2, $$value3);
    assert(boolean4);
    const boolean5 = Reflect.has($object1, string2);
    assert(boolean5);
    const $$value6 = Reflect.get($object1, string2);
    assert($$value3 !== $$value6);
    const $value6 = membrane.clean($$value6);
    const value6 = access.release($value6);
    assert(value3 === value6);
  }

  { // Data Property
    const primitive1 = "foo";
    const $$primitive1 = membrane.taint(primitive1);
    const object2 = Object.create(null);
    const $object2 = access.capture(object2);
    const $descriptor3 = {
      value: $$primitive1,
      writable: true,
      enumerable: true,
      configurable: true
    };
    const string4 = "bar";
    const boolean5 = Reflect.defineProperty($object2, string4, $descriptor3);
    assert(boolean5);
    assert(object2[string4] === primitive1);
    const $descriptor6 = Reflect.getOwnPropertyDescriptor($object2, string4);
    assert(membrane.clean($descriptor6.value) === membrane.clean($descriptor3.value));
    assert($descriptor6.writable === $descriptor3.writable);
    assert($descriptor6.enumerable === $descriptor3.enumerable);
    assert($descriptor6.configurable === $descriptor3.configurable);
  }

  { // Accessor Property
    const object1 = Object.create(null);
    const $object1 = access.capture(object1);
    const closure2 = function () {};
    const $closure2 = access.capture(closure2);
    const closure3 = function () {};
    const $closure3 = access.capture(closure3);
    const $descriptor3 = {
      get: $closure2,
      set: $closure3,
      enumerable: true,
      configurable: true
    };
    const string4 = "bar";
    const boolean5 = Reflect.defineProperty($object1, string4, $descriptor3);
    assert(boolean5);
    assert(Reflect.getOwnPropertyDescriptor(object1, string4).get === closure2);
    assert(Reflect.getOwnPropertyDescriptor(object1, string4).set === closure3);
    const $descriptor6 = Reflect.getOwnPropertyDescriptor($object1, string4);
    assert($descriptor6.get === $descriptor3.get);
    assert($descriptor6.set === $descriptor3.set);
    assert($descriptor6.enumerable === $descriptor3.enumerable);
    assert($descriptor6.configurable === $descriptor3.configurable);
  }

  { // Get/Set/Has: Non writable prototype property
    const object1 = Object.create(null);
    const $object1 = access.capture(object1);
    const $object2 = Object.create($object1);
    const string3 = "foo";
    const value4 = 123;
    Reflect.defineProperty(object1, string3, {value:value4});
    const boolean5 = Reflect.has($object2, string3);
    assert(boolean5);
    const boolean6 = Reflect.set($object2, string3, value4);
    assert(!boolean6);
    const $$value7 = Reflect.get($object2, string3);
    const $value7 = membrane.clean($$value7);
    const value7 = access.release($value7);
    assert(value7 === value4);
  }

  { // Prototype Getter
    const $object1 = Object.create(null);
    const object1 = access.release($object1);
    const primitive2 = "foo";
    const $$primitive2 = membrane.taint(primitive2);
    const primitive3 = "bar";
    const $closure4 = function () {
      "use strict";
      assert(arguments.length === 0);
      assert(membrane.clean(this) === primitive3);
      return $$primitive2;
    };
    const string5 = "bar";
    Reflect.defineProperty($object1, string5, {get:$closure4});
    const $object6 = Object.create($object1);
    const object6 = access.release($object6);
    const primitive7 = Reflect.get(object6, string5, primitive3);
    assert(primitive7 === primitive2);
  }

  { // Prototype Setter
    const $object1 = Object.create(null);
    const object1 = access.release($object1);
    const primitive2 = "foo";
    const $$primitive2 = membrane.taint(primitive2);
    const primitive3 = "bar";
    let executed = false;
    const $closure4 = function () {
      "use strict";
      executed = true;
      assert(arguments.length === 1);
      assert(membrane.clean(arguments[0]) === primitive2);
      assert(membrane.clean(this) === primitive3);
      return membrane.taint(void 0);
    };
    const string5 = "bar";
    Reflect.defineProperty($object1, string5, {set:$closure4});
    const $object6 = Object.create($object1);
    const object6 = access.release($object6);
    debugger;
    const boolean7 = Reflect.set(object6, string5, primitive2, primitive3);
    assert(boolean7);
    assert(executed);
  }
  
  { // Foreign tame array 
    const array1 = ["foo", "bar"];
    const $array1 = access.capture(array1);
    const number2 = 6;
    Reflect.set($array1, "length", number2);
    assert(Reflect.get(array1, "length") === number2);
    const number3 = 9;
    Reflect.defineProperty($array1, "length", {value:number3});
    assert(Reflect.getOwnPropertyDescriptor(array1, "length").value === number3);
  }
  
  { // Native tame array
    const $array1 = ["foo", "bar"];
    Reflect.setPrototypeOf($array1, access.capture(Array.prototype));
    const array1 = access.release($array1);
    const number2 = 6;
    Reflect.set(array1, "length", number2);
    assert(Reflect.get($array1, "length") === number2);
    const number3 = 9;
    Reflect.defineProperty(array1, "length", {value:number3});
    assert(Reflect.getOwnPropertyDescriptor($array1,  "length").value === number3);
  }

};
