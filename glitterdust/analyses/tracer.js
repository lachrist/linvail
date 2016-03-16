
var depth = 0;
function log (msg) {
  var indent = Array(depth+1).join("    ");
  console.log(indent+msg.split("\n").join("\n"+indent));
}

var print = {
  context: function (ctx) { return "@" + ((ctx&&ctx.type) ? (ctx.type+"("+ctx.loc.start.line+":"+ctx.loc.start.column+")") : ctx) },
  wrapper: function (wrp) { return "wrapper-"+wrp.id+"-["+JSON.stringify(wrp.inner)+"]" },
  value: function (val) {
    if (wrappers.has(val))
      return print.wrapper(val);
    if (store.has(val))
      return "object-"+store.get(val);
    if (typeof val === "function")
      return String(val).split("\n")[0].replace(/(function| |{.*)/g, "");
    return val;
  },
  call: function (call) {
    var str;
    if ("constructor" in call)
      str = "construct "+print.value(call.constructor)+" "+print.context(call.context);
    else {
      str = "apply "+print.value(call.function)+" "+print.context(call.context);
      str += "\n  this >> "+print.value(call.this);
    }
    for (var i=0; i<call.length; i++)
      str += "\n  "+i+" >> "+print.value(call[i]);
    return str;
  }
};

function unwrap (ctx) {
  log("unwrap: "+print.wrapper(this)+" "+print.context(ctx));
  return this.inner;
}

var id = 0;
var wrappers = new WeakSet();
var store = new WeakMap();
var intercept = {
  primitive: function (val, ctx) {
    var wrp = {id:++id, inner:val, unwrap:unwrap};
    wrappers.add(wrp);
    log("create: "+print.wrapper(wrp)+" "+print.context(ctx));
    return wrp;
  },
  object: function (obj, ctx) {
    store.set(obj, ++id);
    log("register: "+print.value(obj)+" "+print.context(ctx));
    return obj;
  }
};

var stack = {
  push: function (call) {
    log("push "+print.call(call));
    depth++;
  },
  pop: function (res) {
    depth--;
    log("pop "+print.value(res))
  }
};

module.exports = Linvail(intercept, stack);
