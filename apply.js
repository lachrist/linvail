
module.exports = function (aran) {
  aran.apply = function (fct, th, args) {
    var k = "app"
    var ks = Object.getOwnPropertyNames(fct)
    while(ks.indexOf(k) !== -1) { k = k+"p" }
    fct[k] = Function.prototype.apply
    var res = fct[k](th, args)
    delete fct[k]
    return res
  }
}
