
(function () {
  var o = {}
  for (o.a in {a:1}) {}
  if (o.a !== 'a') { throw 'MemberForin' }
} ())
