
const VirtualProxy = require("virtual-proxy");
const StandaloneWeakmap = require("./standalone-weakmap.js");
const Frontier = require("./frontier.js");
const Oracle = require("./oracle");
const Check = require("./check.js");

const Object_create = Object.create;
const identity = (argument) => argument;
const empty = { has: () => false };

module.exports = (membrane, options={}) => {
  const access = Object_create(null);
  const oracle = Oracle(membrane, access, options.builtins);
  const wild = {
    objects: StandaloneWeakmap(),
    oracle: empty,
    migrate: "capture",
    membrane: {
      taint: identity,
      clean: identity
    }
  };
  const tame = {
    objects: StandaloneWeakmap(),
    oracle: oracle,
    migrate: "release",
    membrane: membrane
  };
  Frontier(access, wild, tame);
  Frontier(access, tame, wild);
  if (options.check)
    Check(membrane, access);
  return access;
};
