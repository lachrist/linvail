
module.exports = ({membrane, access, assert}) => {

  { // Object
    {
      const $object = Object.create(null);
      const $$object = membrane.taint($object);
      assert(access.capture(Object)($$object) === $$object);
    }
    {
      const string = "@";
      const $$string = membrane.taint(string);
      const $$object = access.capture(Object)($$string);
      const $object = membrane.clean($$object);
      const object = access.release($object);
      assert(Reflect.getPrototypeOf($object) === access.capture(String.prototype));
      assert(membrane.clean($object.length) === 1)
      assert(membrane.clean($object[0]) === string);
      assert(String(object) === string);
    }
  }

  { // Object.assign
    const $object1 = Object.create(null);
    const $$object1 = membrane.taint($object1);
    const $object2 = Object.create(null);
    const $$object2 = membrane.taint($object2);
    const $$value = membrane.taint("bar");
    const string1 = "foo";
    $object2[string1] = $$value;
    const string2 = "@";
    const $$string2 = membrane.taint(string2);
    const $$object3 = access.capture(Object.assign)($$object1, $$string2, $$object2);
    assert($$object3 === $$object1);
    assert($object1.foo === $$value);
    assert(membrane.clean($object1[0]) === "@");
  }

  { // Object.create
    const $object1 = Object.create(null);
    const $$object1 = membrane.taint($object1);
    const $$object2 = access.capture(Object.create)($$object1);
    const $object2 = membrane.clean($$object2);
    assert(Reflect.getPrototypeOf($object2) === $object1);
  }

  { // Object.defineProperties
    const $object1 = Object.create(null);
    const $$object1 = membrane.taint($object1);
    const string2 = "foo";
    const $object3 = Object.create(null);
    const $$object3 = membrane.taint($object3);
    const $object4 = Object.create(null);
    const $$object4 = membrane.taint($object4);
    $object3[string2] = $$object4;
    const $$value5 = membrane.taint("bar");
    $object4.value = $$value5;
    const $$object5 = access.capture(Object.defineProperties)($$object1, $$object3);
    assert($$object5 === $$object1);
    assert($object1[string2] === $$value5);
  }

  { // Object.defineProperty
    { // Data descriptor
      const $object1 = Object.create(null);
      const $$object1 = membrane.taint($object1);
      const string2 = "foo";
      const $$string2 = membrane.taint(string2);
      const $object3 = Object.create(null);
      const $$object3 = membrane.taint($object3);
      const $$value4 = membrane.taint("bar");
      $object3.value = $$value4;
      const $$object5 = access.capture(Object.defineProperty)($$object1, $$string2, $$object3);
      assert($$object5 === $$object1);
      assert($object1[string2] === $$value4);
    }
    { // Array length data descriptor
      const array1 = [1,2,3];
      const $array1 = access.capture(array1);
      const $$array1 = membrane.taint($array1);
      const number2 = 123;
      const $$number2 = membrane.taint(number2);
      const $object3 = Object.create(null);
      const $$object3 = membrane.taint($object3);
      $object3.value = $$number2;
      const $$object4 = access.capture(Object.defineProperty)($$array1, membrane.taint("length"), $$object3);
      assert($$object4 === $$array1);
      assert($array1.length === number2);
    }
    { // Accessor descriptor
      const $$value1 = membrane.taint("foo");
      const $closure2 = () => $$value1;
      const $$closure2 = membrane.taint($closure2);
      const $object3 = Object.create(null);
      const $$object3 = membrane.taint($object3);
      const $object4 = Object.create(null);
      const $$object4 = membrane.taint($object4);
      $object4.get = $$closure2;
      const string5 = "bar";
      const $$string5 = membrane.taint(string5);
      const $$object6 = access.capture(Object.defineProperty)($$object3, $$string5, $$object4);
      assert($$object6 === $$object3);
      assert($object3[string5] === $$value1);
    }
  }

  { // Object.entries
    const string = "foo";
    const $object = Object.create(null);
    const $$object = membrane.taint($object);
    const $$value = membrane.taint("bar");
    $object[string] = $$value;
    const $$array1 = access.capture(Object.entries)($$object);
    const $array1 = membrane.clean($$array1);
    assert(Array.isArray($array1));
    assert(Reflect.getPrototypeOf($array1) === access.capture(Array.prototype));
    assert($array1.length === 1);
    const $$array2 = $array1[0];
    const $array2 = membrane.clean($$array2);
    assert(Array.isArray($array2));
    assert(Reflect.getPrototypeOf($array2) === access.capture(Array.prototype));
    assert($array2.length === 2);
    assert(membrane.clean($array2[0]) === string);
    assert($array2[1] === $$value);
  }

  { // Object.getOwnPropertyDescriptor
    { // Data descriptor
      const $object1 = Object.create(null);
      const $$object1 = membrane.taint($object1);
      const $$value2 = membrane.taint("foo");
      const string3 = "bar";
      const $$string3 = membrane.taint(string3);
      $object1[string3] = $$value2;
      const $$object4 = access.capture(Object.getOwnPropertyDescriptor)($$object1, $$string3);
      const $object4 = membrane.clean($$object4);
      assert(Reflect.getPrototypeOf($object4) === access.capture(Object.prototype));
      assert(Reflect.ownKeys($object4).length === 4);
      assert($object4.value === $$value2);
      assert(membrane.clean($object4.writable) === true);
      assert(membrane.clean($object4.enumerable) === true);
      assert(membrane.clean($object4.configurable) === true);
    }
    { // Array length data descriptor
      const array1 = ["foo", "bar"];
      const $array1 = access.capture(array1);
      const $$array1 = membrane.taint($array1);
      const $$object2 = access.capture(Object.getOwnPropertyDescriptor)($$array1, membrane.taint("length"));
      const $object2 = membrane.clean($$object2);
      assert(Reflect.getPrototypeOf($object2) === access.capture(Object.prototype));
      assert(Reflect.ownKeys($object2).length === 4);
      assert(membrane.clean($object2.value) === array1.length);
      assert(membrane.clean($object2.writable) === true);
      assert(membrane.clean($object2.enumerable) === false);
      assert(membrane.clean($object2.configurable) === false);
    }
    { // Accessor descriptor
      const closure1 = () => {};
      const $closure1 = access.capture(closure1);
      const closure2 = () => {};
      const $closure2 = access.capture(closure2);
      const $object3 = Object.create(null);
      const $$object3 = membrane.taint($object3);
      const string4 = "foo";
      const $$string4 = membrane.taint("foo");
      Reflect.defineProperty($object3, string4, {
        get: $closure1, 
        set: $closure2
      });
      const $$object5 = access.capture(Object.getOwnPropertyDescriptor)($$object3, $$string4);
      const $object5 = membrane.clean($$object5);
      assert(Reflect.getPrototypeOf($object5) === access.capture(Object.prototype));
      const keys5 = Reflect.ownKeys($object5);
      assert(keys5.length === 4);
      assert(membrane.clean($object5.get) === $closure1);
      assert(membrane.clean($object5.set) === $closure2);
      assert(membrane.clean($object5.enumerable) === false);
      assert(membrane.clean($object5.configurable) === false);
    }
  }

  {
   { // Object.getOwnPropertyDescriptor;
    const $object1 = Object.create(null);
    const $$object1 = membrane.taint($object1);
    const $$value2 = membrane.taint("foo");
    const string3 = "bar";
    const $$string3 = membrane.taint(string3);
    $object1[string3] = $$value2;
    const $$object4 = access.capture(Object.getOwnPropertyDescriptors)($$object1);
    const $object4 = membrane.clean($$object4);
    assert(Reflect.getPrototypeOf($object4) === access.capture(Object.prototype));
    const keys4 = Reflect.ownKeys($object4)
    assert(keys4.length === 1);
    assert(keys4[0] === string3);
    const $$object5 = $object4[string3];
    const $object5 = membrane.clean($$object5);
    assert(Reflect.getPrototypeOf($object5) === access.capture(Object.prototype));
    const keys5 = Reflect.ownKeys($object5);
    assert(keys5.length === 4);
    assert($object5.value === $$value2);
    assert(membrane.clean($object5.writable) === true);
    assert(membrane.clean($object5.enumerable) === true);
    assert(membrane.clean($object5.configurable) === true);
   }
  }

  { // Object.getOwnPropertyNames
    const string1 = "foo";
    const object2 = {[string1]:1};
    const $object2 = access.capture(object2);
    const $$object2 = membrane.taint($object2);
    const $$array3 = access.capture(Object.getOwnPropertyNames)($$object2);
    const $array3 = membrane.clean($$array3);
    assert(Array.isArray($array3));
    assert(Reflect.getPrototypeOf($array3) === access.capture(Array.prototype));
    assert($array3.length === 1);
    assert(membrane.clean($array3[0]) === string1);
  }

  { // Object.getOwnPropertySymbols
    const symbol1 = Symbol("foo");
    const object2 = {[symbol1]:1};
    const $object2 = access.capture(object2);
    const $$object2 = membrane.taint($object2);
    const $$array3 = access.capture(Object.getOwnPropertySymbols)($$object2);
    const $array3 = membrane.clean($$array3);
    assert(Array.isArray($array3));
    assert(Reflect.getPrototypeOf($array3) === access.capture(Array.prototype));
    assert($array3.length === 1);
    assert(membrane.clean($array3[0]) === symbol1);
  }

  { // Object.keys
    const string1 = "foo";
    const object2 = {[string1]:1};
    const $object2 = access.capture(object2);
    const $$object2 = membrane.taint($object2);
    const $$array3 = access.capture(Object.keys)($$object2);
    const $array3 = membrane.clean($$array3);
    assert(Array.isArray($array3));
    assert(Reflect.getPrototypeOf($array3) === access.capture(Array.prototype));
    assert($array3.length === 1);
    assert(membrane.clean($array3[0]) === string1);
  }

  { // Object.values;
    const $object1 = Object.create(null);
    const $$object1 = membrane.taint($object1);
    const $$value2 = membrane.taint("foo");
    $object1.bar = $$value2;
    const $$array3 = access.capture(Object.values)($$object1);
    const $array3 = membrane.clean($$array3);
    assert(Array.isArray($array3));
    assert(Reflect.getPrototypeOf($array3) === access.capture(Array.prototype));
    assert($array3.length === 1);
    assert($array3[0] === $$value2);
  }

};
