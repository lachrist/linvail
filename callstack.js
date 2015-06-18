
module.exports = function (stack) {

  var object = null;
  var xs = [];

  return {
    initialize: function (o) { object = o },
    apply: function (fct, ctx, args, info) {
      var x = Object.create(null);
      x.function = fct;
      x.this = ctx;
      x.length = args.length;
      x.context = info;
      for (var i=0; i<args.length; i++)
        x[i] = args[i];
      xs.push(x);
      stack.push(x);
    },
    construct: function (cst, args, info) {
      var x = Object.create(null);
      x.constructor = cst;
      x.length = args.length;
      xcontext = info;
      for (var i=0; i<args.length; i++)
        x[i] = args[i];
      xs.push(x);
      stack.push(x);
    },
    return: function (res) {
      stack.pop(res);
      return res;
    },
    try: function (ast) { xs.push(null) },
    catch: function (ast) {
      while (xs.pop())
        stack.pop();
    }
  }

}
