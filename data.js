
module.exports = function (wrap) {
  var wrappers = new WeakSet();
  return {
    enter: function (val, ctx) {
      var w = wrap(val, ctx);
      if (!w)
        return val;
      wrappers.add(w);
      return w;
    },
    leave: function (val, ctx) { return wrappers.has(val) ? val.unwrap(ctx) : val }
  }
}
