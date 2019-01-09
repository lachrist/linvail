
module.exports = ({access, membrane, oracle, assert}) => {
  
  { // Array
    { // Length
      const number1 = 9;
      const $$number1 = membrane.taint(number1);
      const $$array2 = access.capture(Array)($$number1);
      const $array2 = membrane.clean($$array2);
      assert(Reflect.getPrototypeOf($array2) === access.capture(Array.prototype));
      assert($array2.length === number1);
    }
    { // Elements
      const $$value1 = membrane.taint("foo");
      const $$value2 = membrane.taint("bar");
      const $$array3 = access.capture(Array)($$value1, $$value2);
      const $array3 = membrane.clean($$array3);
      assert(Reflect.getPrototypeOf($array3) === access.capture(Array.prototype))
      assert($array3.length === 2);
      assert($array3[0] === $$value1);
      assert($array3[1] === $$value2);
    }
  }
  
  { // Array.from
    { // Array-like object
      const $object1 = Object.create(null);
      const $$object1 = membrane.taint($object1);
      const number2 = 3;
      const $$number2 = membrane.taint(number2);
      $object1.length = $$number2;
      const $$value3 = membrane.taint("foo");
      $object1[1] = $$value3;
      const $$array4 = access.capture(Array.from)($$object1);
      const $array4 = membrane.clean($$array4);
      assert(Reflect.getPrototypeOf($array4) === access.capture(Array.prototype));
      assert($array4.length === 3);
      assert(membrane.clean($array4[0]) === undefined);
      assert($array4[1] === $$value3);
      assert(membrane.clean($array4[2]) === undefined);
    }
    { // String iterator
      const string1 = "foo";
      const $$string1 = membrane.taint(string1);
      const $$array2 = access.capture(Array.from)($$string1);
      const $array2 = membrane.clean($$array2);
      assert(Reflect.getPrototypeOf($array2) === access.capture(Array.prototype));
      assert($array2.length === string1.length);
      assert(membrane.clean($array2[0]) === string1[0]);
      assert(membrane.clean($array2[1]) === string1[1]);
      assert(membrane.clean($array2[2]) === string1[2]);
    }
  }
  
  { // Array.of
    const $$value1 = membrane.taint("foo");
    const $$value2 = membrane.taint("bar");
    const $$array3 = access.capture(Array.of)($$value1, $$value2);
    const $array3 = membrane.clean($$array3);
    assert(Reflect.getPrototypeOf($array3) === access.capture(Array.prototype));
    assert($array3.length === 2);
    assert($array3[0] === $$value1);
    assert($array3[1] === $$value2);
  }
  
};
