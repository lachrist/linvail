
const VirtualProxy = require("virtual-proxy");
const StandaloneWeakmap = require("./standalone-weakmap.js");
const Frontier = require("./frontier.js");
const Oracle = require("./oracle");
const Check = require("./check.js");

const identity = (argument) => argument;
const empty = { has: () => false };

module.exports = (membrane, options={}) => {
  const access = {__proto__:null};
  const oracle = StandaloneWeakmap();
  Oracle(membrane, access, oracle, global);
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
  access.sandbox = (sandbox) => {
    Oracle(membrane, access, oracle, sandbox);
  };
  return access;
};
