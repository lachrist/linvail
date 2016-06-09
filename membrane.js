
module.exports = function (wrap) {
  var wrappers = new WeakSet();
  return {
    leave: function (value, node) { return wrappers.has(value) ? value.unwrap(node) : value },
    enter: function (value, node) {
      var wrapper = wrap(value, node);
      wrapper && wrappers.add(wrapper);
      return wrapper || value;
    }
  };
};
