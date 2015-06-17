
var Linvail = require("..");
var id = 0;

function printi (x) { x.type ? x.type+"@"+x.loc.start.line+":"+x.loc.start.column : x }

var intercept = {
  primitive: function (val, info) {
    console.log("primitive"+(++id)+" ["+JSON.stringify(val)+"] intercepted @ "+printi(info));
    return {
      id: id,
      inner: val,
      unwrap: function (info) {
        console.log("primitive"+this.id+" accessed @ "+printi(info));
        return this.inner;
      }
    };
  },
  object: function (obj, info) {
    console.log("object"+(++id)+" ["+obj+"] intercepted @ "+printi(info));
    return obj;
  }
}

var callstack = {
  push: function (fct, ctx, args, info) { console.log("PUSH "+printi(info)) },
  pop: function (res) { console.log("POP") },
  try: function (info) { console.log("TRY") },
  catch: function (err, info) { console.log("CATCH") }
};

module.exports = Linvail(intercept, callstack, Aran);
