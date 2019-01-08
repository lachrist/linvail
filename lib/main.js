
const VirtualProxy = require("virtual-proxy");
const StandaloneWeakmap = require("./standalone-weakmap.js");
const Frontier = require("./frontier.js");
const Oracle = require("./oracle");
const Check = require("./check.js");

const Object_create = Object.create;
const identity = (argument) => argument;

module.exports = (membrane, {builtins, check}) => {
  const wild = {
    objects: StandaloneWeakmap(),
    migrate: "capture",
    membrane: {
      enter: identity,
      leave: identity
    }
  };
  const tame = {
    objects: StandaloneWeakmap(),
    migrate: "release",
    membrane: membrane
  };
  const access = Object_create(null);
  Frontier(access, wild, tame);
  Frontier(access, tame, wild);
  Check(membrane, access);
  return {
    access,
    membrane,
    oracle: Oracle(membrane, access, builtins)
  };
};
