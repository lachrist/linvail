
module.exports = ({access, membrane, oracle, assert}) => {
  
  {
    // Reflect.apply
    const $$value1 = membrane.enter("foo");
    const $$value2 = membrane.enter("bar");
    const $$value3 = membrane.enter("qux");
    const $closure4 = function () {
      "use strict";
      assert(new.target === undefined);
      assert(this === $$value1);
      assert(arguments.length === 1);
      assert(arguments[0] === $$value2);
      return $$value3;
    };
    const $$closure4 = membrane.enter($closure4);
    const $array5 = [$$value2];
    Reflect.setPrototypeOf($array5, access.capture(Array.prototype));
    const $$array5 = membrane.enter($array5);
    const $$value6 = oracle.get(Reflect.apply)($$closure4, $$value1, $$array5);
    assert($$value6 === $$value3);
  }
  
  {
    // Reflect.construct
    const $$value1 = membrane.enter("foo");
    const $$value2 = membrane.enter(Object.create(null));
    const $closure3 = function () {
      "use strict";
      assert(new.target === $constructor5);
      assert(arguments.length === 1);
      assert(arguments[0] === $$value1);
      return $$value2;
    };
    const $$closure3 = membrane.enter($closure3);
    const $array4 = [$$value1];
    Reflect.setPrototypeOf($array4, access.capture(Array.prototype));
    const $$array4 = membrane.enter($array4);
    const $constructor5 = access.capture(Boolean);
    const $$constructor5 = membrane.enter($constructor5);
    const $$value6 = oracle.get(Reflect.construct)($$closure3, $$array4, $$constructor5);
    assert($$value2 === $$value6);
  }
  
  {
    // Reflect.defineProperty
    { // Data descriptor
      const $object1 = Object.create(null);
      const $$object1 = membrane.enter($object1);
      const string2 = "foo";
      const $$string2 = membrane.enter(string2);
      const $object3 = Object.create(null);
      const $$object3 = membrane.enter($object3);
      const $$value4 = membrane.enter("bar");
      $object3.value = $$value4;
      const $$object5 = oracle.get(Reflect.defineProperty)($$object1, $$string2, $$object3);
      const $object5 = membrane.leave($$object5);
      assert($object5 === true);
      assert($object1[string2] === $$value4);
    }
    { // Array length data descriptor
      const array1 = [1,2,3];
      const $array1 = access.capture(array1);
      const $$array1 = membrane.enter($array1);
      const number2 = 123;
      const $$number2 = membrane.enter(number2);
      const $object3 = Object.create(null);
      const $$object3 = membrane.enter($object3);
      $object3.value = $$number2;
      const $$object4 = oracle.get(Reflect.defineProperty)($$array1, membrane.enter("length"), $$object3);
      const $object4 = membrane.leave($$object4);
      assert($object4 === true);
      assert($array1.length === number2);
    }
    { // Accessor descriptor
      const $$value1 = membrane.enter("foo");
      const $closure2 = () => $$value1;
      const $$closure2 = membrane.enter($closure2);
      const $object3 = Object.create(null);
      const $$object3 = membrane.enter($object3);
      const $object4 = Object.create(null);
      const $$object4 = membrane.enter($object4);
      $object4.get = $$closure2;
      const string5 = "bar";
      const $$string5 = membrane.enter(string5);
      const $$object6 = oracle.get(Reflect.defineProperty)($$object3, $$string5, $$object4);
      const $object6 = membrane.leave($$object6);
      assert($object6 === true);
      assert($object3[string5] === $$value1);
    }
  }
  
  { // Reflect.get
    { // Access descriptor
      const $object1 = Object.create(null);
      const $$object1 = membrane.enter($object1);
      const string2 = "foo";
      const $$string2 = membrane.enter(string2);
      const $$value3 = membrane.enter("bar");
      $object1[string2] = $$value3;
      const $$value4 = oracle.get(Reflect.get)($$object1, $$string2);
      assert($$value4 === $$value3);
    }
    { // Array length data descriptor
      const array1 = ["foo", "bar"];
      const $array1 = access.capture(array1);
      const $$array1 = membrane.enter($array1);
      const $$value2 = oracle.get(Reflect.get)($$array1, membrane.enter("length"));
      const $value2 = membrane.leave($$value2);
      assert($value2 === 2);
    }
    { // Accessor descriptor
      const $object1 = Object.create(null);
      const $$object1 = membrane.enter($object1);
      const string2 = "foo";
      const $$string2 = membrane.enter(string2);
      const $$value3 = membrane.enter("bar");
      const $$value4 = membrane.enter("qux");
      Reflect.defineProperty($object1, string2, {
        get: function () {
          "use strict";
          assert(this === $$value3);
          assert(arguments.length === 0);
          return $$value4;
        }
      });
      const $$value5 = oracle.get(Reflect.get)($$object1, $$string2, $$value3);
      assert($$value4 === $$value5);
    }
  }
  
  { // Reflect.getOwnPropertyDescriptor
    { // Data descriptor
      const $object1 = Object.create(null);
      const $$object1 = membrane.enter($object1);
      const $$value2 = membrane.enter("foo");
      const string3 = "bar";
      const $$string3 = membrane.enter(string3);
      $object1[string3] = $$value2;
      const $$object4 = oracle.get(Reflect.getOwnPropertyDescriptor)($$object1, $$string3);
      const $object4 = membrane.leave($$object4);
      assert(Reflect.getPrototypeOf($object4) === access.capture(Object.prototype));
      assert(Reflect.ownKeys($object4).length === 4);
      assert($object4.value === $$value2);
      assert(membrane.leave($object4.writable) === true);
      assert(membrane.leave($object4.enumerable) === true);
      assert(membrane.leave($object4.configurable) === true);
    }
    { // Array length data descriptor
      const array1 = ["foo", "bar"];
      const $array1 = access.capture(array1);
      const $$array1 = membrane.enter($array1);
      const $$object2 = oracle.get(Reflect.getOwnPropertyDescriptor)($$array1, membrane.enter("length"));
      const $object2 = membrane.leave($$object2);
      assert(Reflect.getPrototypeOf($object2) === access.capture(Object.prototype));
      assert(Reflect.ownKeys($object2).length === 4);
      assert(membrane.leave($object2.value) === array1.length);
      assert(membrane.leave($object2.writable) === true);
      assert(membrane.leave($object2.enumerable) === false);
      assert(membrane.leave($object2.configurable) === false);
    }
    { // Accessor descriptor
      const closure1 = () => {};
      const $closure1 = access.capture(closure1);
      const closure2 = () => {};
      const $closure2 = access.capture(closure2);
      const $object3 = Object.create(null);
      const $$object3 = membrane.enter($object3);
      const string4 = "foo";
      const $$string4 = membrane.enter("foo");
      Reflect.defineProperty($object3, string4, {
        get: $closure1, 
        set: $closure2
      });
      const $$object5 = oracle.get(Reflect.getOwnPropertyDescriptor)($$object3, $$string4);
      const $object5 = membrane.leave($$object5);
      assert(Reflect.getPrototypeOf($object5) === access.capture(Object.prototype));
      const keys5 = Reflect.ownKeys($object5);
      assert(keys5.length === 4);
      assert(membrane.leave($object5.get) === $closure1);
      assert(membrane.leave($object5.set) === $closure2);
      assert(membrane.leave($object5.enumerable) === false);
      assert(membrane.leave($object5.configurable) === false);
    }
  }
  
  { // Relect.ownKeys
    const string1 = "foo";
    const symbol2 = Symbol("bar");
    const object3 = {[string1]:1, [symbol2]:2};
    const $object3 = access.capture(object3);
    const $$object3 = membrane.enter($object3);
    const $$array4 = oracle.get(Reflect.ownKeys)($$object3);
    const $array4 = membrane.leave($$array4);
    assert(Array.isArray($array4));
    assert(Reflect.getPrototypeOf($array4) === access.capture(Array.prototype));
    assert($array4.length === 2);
    assert(membrane.leave($array4[0]) === string1 || membrane.leave($array4[0]) === symbol2);
    assert(membrane.leave($array4[1]) === string1 || membrane.leave($array4[1]) === symbol2);
  }
  
  { // Reflect.set
    { // Data descriptor
      const $object1 = Object.create(null);
      const $$object1 = membrane.enter($object1);
      const string2 = "foo";
      const $$string2 = membrane.enter(string2);
      const $$value3 = membrane.enter("bar");
      const $$value4 = oracle.get(Reflect.set)($$object1, $$string2, $$value3);
      const $value4 = membrane.leave($$value4);
      assert($value4 === true);
      const $$value6 = $object1[string2];
      assert($$value6 === $$value3);
    }
    { // Array length data descriptor
      const array1 = ["foo", "bar"];
      const $array1 = access.capture(array1);
      const $$array1 = membrane.enter($array1);
      const number2 = 123;
      const $$number2 = membrane.enter(number2);
      const $$value3 = oracle.get(Reflect.set)($$array1, membrane.enter("length"), $$number2);
      const $value3 = membrane.leave($$value3);
      assert($value3 === true);
      assert(array1.length === 123);
    }
    { // Accessor descriptor
      const $object1 = Object.create(null);
      const $$object1 = membrane.enter($object1);
      const string2 = "foo";
      const $$string2 = membrane.enter(string2);
      const $$value3 = membrane.enter("bar");
      const $$value4 = membrane.enter("qux");
      let executed = false;
      const $closure5 = function () {
        executed = true;
        assert(this === $$value3);
        assert(arguments.length === 1);
        assert(arguments[0] === $$value4);
        return membrane.enter(undefined);
      }
      Reflect.defineProperty($object1, string2, {set:$closure5});
      const $$value6 = oracle.get(Reflect.set)($$object1, $$string2, $$value4, $$value3);
      const $value6 = membrane.leave($$value6);
      assert(executed);
      assert($value6 === true);
    }
  }
  
};






