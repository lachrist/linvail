
(function () {
  var k
  for (k in {a:1}) {}
  if (k !== 'a') { throw 'IdentifierForIn' }
} ())
