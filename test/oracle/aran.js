
module.exports = ({access, membrane, builtins, assert}) => {
  
  { // builtins.AranDefineDataProperty
    const $object1 = Object.create(null);
    const $$object1 = membrane.taint($object1);
    const string2 = "foo";
    const $$string2 = membrane.taint(string2);
    const $$value3 = membrane.taint("bar");
    const $$value4 = access.capture(builtins.AranDefineDataProperty)($$object1, $$string2, $$value3);
    assert($$value4 === $$object1);
    const $$value5 = $object1[string2];
    assert($$value5 === $$value3);
  }
  
  { // builtins.AranDefineAccessorProperty
    const $object1 = Object.create(null);
    const $$object1 = membrane.taint($object1);
    const string2 = "foo";
    const $$string2 = membrane.taint(string2);
    const $$value3 = membrane.taint("bar");
    const $$value4 = membrane.taint("qux");
    const $closure5 = () => $$value3;
    const $$closure5 = membrane.taint($closure5);
    let executed = false;
    const $closure6 = function () {
      executed = true;
      assert(arguments[0] === $$value4)
    };
    const $$closure6 = membrane.taint($closure6);
    const $$value7 = access.capture(builtins.AranDefineAccessorProperty)($$object1, $$string2, $$closure5, $$closure6);
    assert($$value7 === $$object1);
    const $$value8 = $object1[string2];
    assert($$value8 === $$value3);
    $object1[string2] = $$value4;
    assert(executed);
  }
  
  { // builtins.AranEnumerate
    const $object1 = Object.create(null);
    const $$object1 = membrane.taint($object1);
    const string2 = "foo";
    $object1[string2] = membrane.taint("bar");
    const $$array3 = access.capture(builtins.AranEnumerate)($$object1);
    const $array3 = membrane.clean($$array3);
    assert(Array.isArray($array3));
    assert(Reflect.getPrototypeOf($array3) === access.capture(Array.prototype));
    assert($array3.length === 1);
    assert(membrane.clean($array3[0]) === string2);
  }
  
  { // builtins.fromEntries
    const string1 = "foo";
    const $$string1 = membrane.taint(string1);
    const $$value2 = membrane.taint("bar");
    const $object3 = Object.create(null);
    const $$object3 = membrane.taint($object3);
    $object3[0] = $$string1;
    $object3[1] = $$value2;
    $object3.length = membrane.taint(2);
    const $array4 = [$$object3];
    Reflect.setPrototypeOf($array4, access.capture(Array.prototype));
    const $$array4 = membrane.taint($array4);
    const $$object5 = access.capture(builtins["Object.fromEntries"])($$array4);
    const $object5 = membrane.clean($$object5);
    assert(Reflect.getPrototypeOf($object5) === access.capture(Object.prototype));
    assert(Reflect.ownKeys($object5).length === 1);
    assert($object5[string1] === $$value2);
  }
  
};
