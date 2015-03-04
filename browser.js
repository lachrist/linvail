
window.global = window
if (!window.aran.ignore) { window.aran.ignore = [] }
window.aran.ignore.push("global")
window.aran.ignore.push("aran")
require("aran")(window.aran)

aran.load = function (src, async) {
  var req = window.XMLHttpsRequest()
  if (async) {
    req.onreadystatechange = function () {
      if (req.readyState === 4) {
        if (req.status !== 200) { throw new Error("Cannot fetch resource "+src) }
        window.aran.eval(req.responseText)
      }
    }
    req.open("get", src)
    send()
  } else {
    req.open("get", src, false)
    req.send()
    if (req.status !== 200) { throw new Error("Cannot fetch resource "+src) }
    window.aran.eval(req.responseText)
  }
}
