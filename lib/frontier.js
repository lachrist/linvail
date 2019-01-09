
const VirtualProxy = require("virtual-proxy");

const String = global.String;
const Error = global.Error;
const Array_isArray = Array.isArray;
const Object_create = Object.create;

const Reflect_apply = Reflect.apply;
const Reflect_construct = Reflect.construct;
const Reflect_defineProperty = Reflect.defineProperty;
const Reflect_deleteProperty = Reflect.deleteProperty;
const Reflect_getOwnPropertyDescriptor = Reflect.getOwnPropertyDescriptor;
const Reflect_getPrototypeOf = Reflect.getPrototypeOf;
const Reflect_isExtensible = Reflect.isExtensible;
const Reflect_preventExtensions = Reflect.preventExtensions;
const Reflect_ownKeys = Reflect.ownKeys;
const Reflect_setPrototypeOf = Reflect.setPrototypeOf;

module.exports = (access, {membrane:membraneA, oracle:oracleA, objects:objectsA, migrate:forward}, {membrane:membraneB, oracle:oracleB, objects:objectsB, migrate:backward}) => {

  access[forward] = (valueA) => {
    if (valueA === null || valueA === void 0 || valueA === true || valueA === false)
      return valueA;
    if (typeof valueA === "number" || typeof valueA === "string" || typeof valueA === "symbol")
      return valueA;
    if (objectsB.has(valueA))
      return objectsB.get(valueA);
    if (objectsA.has(valueA))
      throw new Error("Object already registered in the other region");
    const objectB = VirtualProxy(valueA, handlers);
    objectsA.set(objectB, valueA);
    objectsB.set(valueA, objectB);
    return objectB;
  };
  
  const handlers = Object_create(null);
  
  handlers.isExtensible = Reflect_isExtensible;

  handlers.ownKeys = Reflect_ownKeys;

  handlers.preventExtensions = Reflect_preventExtensions;

  handlers.deleteProperty = Reflect_deleteProperty;

  handlers.getPrototypeOf = (objectA) => access[forward](Reflect_getPrototypeOf(objectA));

  handlers.setPrototypeOf = (objectA, objectB) => Reflect_setPrototypeOf(objectA, access[backward](objectB));

  handlers.apply = (objectA, valueB$, valueB$s) => {
    if (oracleB.has(objectA))
      return Reflect_apply(oracleB.get(objectA), valueB$, valueB$s);
    const valueA$ = membraneA.taint(access[backward](membraneB.clean(valueB$)));
    const valueA$s = [];
    for (let index = 0, length = valueB$s.length; index < length; index++)
      valueA$s[index] = membraneA.taint(access[backward](membraneB.clean(valueB$s[index])));
    return membraneB.taint(access[forward](membraneA.clean(Reflect_apply(objectA, valueA$, valueA$s))));
  };

  handlers.construct = (objectA, valueB$s, constructorB) => {
    if (oracleB.has(objectA))
      return Reflect_construct(oracleB.get(objectA), valueB$s, constructorB);
    const valueA = access[backward](constructorB);
    const valueA$s = [];
    for (let index = 0, length = valueB$s.length; index < length; index++)
      valueA$s[index] = membraneA.taint(access[backward](membraneB.clean(valueB$s[index])));
    return membraneB.taint(access[forward](membraneA.clean(Reflect_construct(objectA, valueA$s, valueA))));
  };

  handlers.defineProperty = (objectA, primitive, descriptorB) => {
    const descriptorA = Object_create(null);
    if (Reflect_getOwnPropertyDescriptor(descriptorB, "get") || Reflect_getOwnPropertyDescriptor(descriptorB, "set")) {
      if (Reflect_getOwnPropertyDescriptor(descriptorB, "get")) {
        descriptorA.get = access[backward](descriptorB.get);
      }
      if (Reflect_getOwnPropertyDescriptor(descriptorB, "set")) {
        descriptorA.set = access[backward](descriptorB.set);
      }
    } else {
      if (Array_isArray(objectA) && primitive === "length") {
        descriptorA.value = descriptorB.value;
      } else {
        descriptorA.value = membraneA.taint(access[backward](membraneB.clean(descriptorB.value)));
      }
      descriptorA.writable = descriptorA.writable;
    }
    descriptorA.enumerable = descriptorB.enumerable;
    descriptorA.configurable = descriptorB.configurable;
    return Reflect_defineProperty(objectA, primitive, descriptorA);
  };

  handlers.getOwnPropertyDescriptor = (objectA, primitive) => {
    const descriptorA = Reflect_getOwnPropertyDescriptor(objectA, primitive);
    let descriptorB;
    if (descriptorA) {
      if (Reflect_getOwnPropertyDescriptor(descriptorA, "value")) {
        if (Array_isArray(objectA) && primitive === "length") {
          descriptorB = descriptorA;
        } else {
          descriptorB = {
            value: membraneB.taint(access[forward](membraneA.clean(descriptorA.value))),
            writable: descriptorA.writable,
            enumerable: descriptorA.enumerable,
            configurable: descriptorA.configurable
          };
        }
      } else {
        descriptorB = {
          get: access[forward](descriptor.get),
          set: access[forward](descriptor.set),
          enumerable: descriptorA.enumerable,
          configurable: descriptorA.configurable
        };
      }
    } else {
      descriptorB = descriptorA;
    }
    return descriptorB;
  };

};
