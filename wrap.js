
module.exports = function (aran) {

  var store, raw, wrap
  (function () {
    var xs = []
    lookup = function (k) { for (var i=0; i<xs.length; i++) { if (k===xs[i][0]) { return xs[i][1] } } }
    store = function (k, v) { return xs.push([k,v]) }
  } ());


  var proxymize
  (function () {
    handers = {
      
    }
  } ())

  function wrap_prim (prim) {
    return aran.wrap(function () {
      var raw_this = aran.unwrap(this)
      var raw_args = []
      for (var i=0; i<arguments.length; i++) { raw_args[i] = aran.unwrap(arguments[i]) }
      prim.apply(raw_this, raw_args) 
    })

  }

  aran.traps.fct = function (fct) {
    []
  }

  aran.traps.apply = function (fct, th, args) {
    return fct.apply(th, args)
  }


  function loop (path, x) {
    if (x === undefined) { return x }
    if (x === null) { return trap_global(path, x) }
    if (typeof x === "boolean") { return trap_global(path, x) }
    if (typeof x === "number") { return trap_global(path, x) }
    if (typeof x === "string") { return trap_global(path, x) }
    var w = lookup(x)
    if (w) { return w } // shaky condition
    if (typeof w === "function") { w = trap_global(path, x) }
    else if (Array.isArray(x)) { w = trap_array() }
    else { w = trap_object() }
    store(x, w)
    trap_set(w, trap_wrap("__proto__"), loop(extval(path, "__proto__"), x.__proto__))
    var ks = Object.getOwnPropertyNames(x)
    for (var i=0; i<ks.length; i++) {
      var d = Object.getOwnPropertyDescriptor(x, ks[i])
      if (d.value) { d.value = loop(extval(path, ks[i]), d.value) }
      if (d.get)   { d.get   = loop(extget(path, ks[i]), d.get)   }
      if (d.set)   { d.set   = loop(extset(path, ks[i]), d.set)   }
      trap_define(w, ks[i], d)
    }
    if (!Object.isExtensible) { trap_prevent_extension(w) }
    if (Object.isSealed) { trap_seal(w) }
    if (Object.isFrozen) { trap_freeze(w) }
    return w
  }




}
