
module.exports = function (sources) {
  return function (idx) {
    for (url in  sources) {
      var n = search(sources[url], idx)
      if (n)
        return {url:url, top:sources[url], node:n};
    }
  }
}

function search (ast, idx) {
  var tmp;
  if (typeof ast !== "object" || ast === null)
    return;
  if (ast.bounds && idx === ast.bounds[0])
    return ast;
  if (ast.bounds && (idx < ast.bounds[0] || idx > ast.bounds[1]))
    return;
  for (var k in ast)
    if (tmp = search(ast[k], idx))
      return tmp;
}
