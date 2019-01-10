
module.exports = ({access, membrane, oracle, assert}) => {
  
  {
    // Reflect.apply
    const $$value1 = membrane.taint("foo");
    const $$value2 = membrane.taint("bar");
    const $$value3 = membrane.taint("qux");
    const $closure4 = function () {
      "use strict";
      assert(new.target === undefined);
      assert(this === $$value1);
      assert(arguments.length === 1);
      assert(arguments[0] === $$value2);
      return $$value3;
    };
    const $$closure4 = membrane.taint($closure4);
    const $array5 = [$$value2];
    Reflect.setPrototypeOf($array5, access.capture(Array.prototype));
    const $$array5 = membrane.taint($array5);
    const $$value6 = access.capture(Reflect.apply)($$closure4, $$value1, $$array5);
    assert($$value6 === $$value3);
  }
  
  {
    // Reflect.construct
    const $$value1 = membrane.taint("foo");
    const $$value2 = membrane.taint(Object.create(null));
    const $closure3 = function () {
      "use strict";
      assert(new.target === $constructor5);
      assert(arguments.length === 1);
      assert(arguments[0] === $$value1);
      return $$value2;
    };
    const $$closure3 = membrane.taint($closure3);
    const $array4 = [$$value1];
    Reflect.setPrototypeOf($array4, access.capture(Array.prototype));
    const $$array4 = membrane.taint($array4);
    const $constructor5 = access.capture(Boolean);
    const $$constructor5 = membrane.taint($constructor5);
    const $$value6 = access.capture(Reflect.construct)($$closure3, $$array4, $$constructor5);
    assert($$value2 === $$value6);
  }
  
  {
    // Reflect.defineProperty
    { // Data descriptor
      const $object1 = Object.create(null);
      const $$object1 = membrane.taint($object1);
      const string2 = "foo";
      const $$string2 = membrane.taint(string2);
      const $object3 = Object.create(null);
      const $$object3 = membrane.taint($object3);
      const $$value4 = membrane.taint("bar");
      $object3.value = $$value4;
      const $$object5 = access.capture(Reflect.defineProperty)($$object1, $$string2, $$object3);
      const $object5 = membrane.clean($$object5);
      assert($object5 === true);
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
      const $$object4 = access.capture(Reflect.defineProperty)($$array1, membrane.taint("length"), $$object3);
      const $object4 = membrane.clean($$object4);
      assert($object4 === true);
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
      const $$object6 = access.capture(Reflect.defineProperty)($$object3, $$string5, $$object4);
      const $object6 = membrane.clean($$object6);
      assert($object6 === true);
      assert($object3[string5] === $$value1);
    }
  }
  
  { // Reflect.get
    { // Access descriptor
      const $object1 = Object.create(null);
      const $$object1 = membrane.taint($object1);
      const string2 = "foo";
      const $$string2 = membrane.taint(string2);
      const $$value3 = membrane.taint("bar");
      $object1[string2] = $$value3;
      const $$value4 = access.capture(Reflect.get)($$object1, $$string2);
      assert($$value4 === $$value3);
    }
    { // Array length data descriptor
      const array1 = ["foo", "bar"];
      const $array1 = access.capture(array1);
      const $$array1 = membrane.taint($array1);
      const $$value2 = access.capture(Reflect.get)($$array1, membrane.taint("length"));
      const $value2 = membrane.clean($$value2);
      assert($value2 === 2);
    }
    { // Accessor descriptor
      const $object1 = Object.create(null);
      const $$object1 = membrane.taint($object1);
      const string2 = "foo";
      const $$string2 = membrane.taint(string2);
      const $$value3 = membrane.taint("bar");
      const $$value4 = membrane.taint("qux");
      Reflect.defineProperty($object1, string2, {
        get: function () {
          "use strict";
          assert(this === $$value3);
          assert(arguments.length === 0);
          return $$value4;
        }
      });
      const $$value5 = access.capture(Reflect.get)($$object1, $$string2, $$value3);
      assert($$value4 === $$value5);
    }
  }
  
  { // Reflect.getOwnPropertyDescriptor
    { // Data descriptor
      const $object1 = Object.create(null);
      const $$object1 = membrane.taint($object1);
      const $$value2 = membrane.taint("foo");
      const string3 = "bar";
      const $$string3 = membrane.taint(string3);
      $object1[string3] = $$value2;
      const $$object4 = access.capture(Reflect.getOwnPropertyDescriptor)($$object1, $$string3);
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
      const $$object2 = access.capture(Reflect.getOwnPropertyDescriptor)($$array1, membrane.taint("length"));
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
      const $$object5 = access.capture(Reflect.getOwnPropertyDescriptor)($$object3, $$string4);
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
  
  { // Relect.ownKeys
    const string1 = "foo";
    const symbol2 = Symbol("bar");
    const object3 = {[string1]:1, [symbol2]:2};
    const $object3 = access.capture(object3);
    const $$object3 = membrane.taint($object3);
    const $$array4 = access.capture(Reflect.ownKeys)($$object3);
    const $array4 = membrane.clean($$array4);
    assert(Array.isArray($array4));
    assert(Reflect.getPrototypeOf($array4) === access.capture(Array.prototype));
    assert($array4.length === 2);
    assert(membrane.clean($array4[0]) === string1 || membrane.clean($array4[0]) === symbol2);
    assert(membrane.clean($array4[1]) === string1 || membrane.clean($array4[1]) === symbol2);
  }
  
  { // Reflect.set
    { // Data descriptor
      const $object1 = Object.create(null);
      const $$object1 = membrane.taint($object1);
      const string2 = "foo";
      const $$string2 = membrane.taint(string2);
      const $$value3 = membrane.taint("bar");
      const $$value4 = access.capture(Reflect.set)($$object1, $$string2, $$value3);
      const $value4 = membrane.clean($$value4);
      assert($value4 === true);
      const $$value6 = $object1[string2];
      assert($$value6 === $$value3);
    }
    { // Array length data descriptor
      const array1 = ["foo", "bar"];
      const $array1 = access.capture(array1);
      const $$array1 = membrane.taint($array1);
      const number2 = 123;
      const $$number2 = membrane.taint(number2);
      const $$value3 = access.capture(Reflect.set)($$array1, membrane.taint("length"), $$number2);
      const $value3 = membrane.clean($$value3);
      assert($value3 === true);
      assert(array1.length === 123);
    }
    { // Accessor descriptor
      const $object1 = Object.create(null);
      const $$object1 = membrane.taint($object1);
      const string2 = "foo";
      const $$string2 = membrane.taint(string2);
      const $$value3 = membrane.taint("bar");
      const $$value4 = membrane.taint("qux");
      let executed = false;
      const $closure5 = function () {
        executed = true;
        assert(this === $$value3);
        assert(arguments.length === 1);
        assert(arguments[0] === $$value4);
        return membrane.taint(undefined);
      }
      Reflect.defineProperty($object1, string2, {set:$closure5});
      const $$value6 = access.capture(Reflect.set)($$object1, $$string2, $$value4, $$value3);
      const $value6 = membrane.clean($$value6);
      assert(executed);
      assert($value6 === true);
    }
  }
  
};
