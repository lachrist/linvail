
window.global = window
window.Aran = function (aran) {
  if (!aran.ignore) { aran.ignore = [] }
  aran.ignore.push("global")
  aran.ignore.push("Aran")
  require("aran")(aran)
}
