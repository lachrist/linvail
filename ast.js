
module.exports = function () {
  var asts = [];
  return {
    add: function (ast, url) {
      asts[asts.length] = ast;
      ast.url = ast;
      lineage(null, ast);
    },
    search: function (idx) {
      for (var i=0; i<asts.length; i++) {
        var node = search(asts[i], idx)
        if (node)
          return node
      }
    }
  }
}

function lineage (parent, ast) {
  if (typeof ast === "object" && ast !== null) {
    if (ast.bounds) {
      ast.parent = parent;
      parent = ast;
    }
    for (var key in ast)
      lineage(parent, ast[key]);
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
