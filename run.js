#!/usr/bin/env node

// usage: linvail [node|browser] options.js <in >out

var fs = require("fs")

var env, opt
if (process.argv.length === 0) {
  throw new Error("Not enough argument")
} else if (process.argv.length === 1) {
  env = "browser"
  opt = process.argv[0]
} else {
  env = process.argv[0]
  opt = process.argv[1]
}

fs.readFile(opt, function (err, buf) {
  if (err) { throw err }
  if (env === "node") { node(buf) }
  else if (env === "browser") { browser(buf) }
  else { throw new Error("Unrecognized environment parameter") }
})

function node (opt_buf) {
  fs.readFile("node-bundle.js", function (err, buf) {
    if (err) { throw err }
    process.stdout.write(opt_buf)
    process.stdout.write(buf)
    process.stdout.write("aran.eval(")
    process.stdout.write(JSON.stringify(process.stdin.read()))
    process.stdout.write(")")
  })
}

function browser (opt_buf) {

  var out = process.stdout
  var is_js = false
  // </script> can only occurs within string litteral and comments
  // as "</script>" and "<\/script>" evaluate to the same string
  // the semantic is preserved
  function js_escape (str) { return str.replace(/<\/script>/g, "<\\/script>") }

  fs.readFile("browser-bundle.js", function (err, buf) {

    if (err) { throw err }

    process.stdin.pipe(new htmlparser.Parser({
      onopentag: function(tag, attrs) {
        out.write("<"+tag)
        for (var attr in attrs) {
          out.write(" ")
          out.write(attr)
          out.write("=\"")
          out.write(attrs[attr]) // attributes are not decoded (&lt; does not become <)
          out.write("\"")
        }
        out.write(">")
        if (tag === "script") {
          if (attrs.src) {
            out.write("aran.load(\"")
            out.write(attrs.src)
            out.write("\", ")
            out.write(attrs.async)
            out.write(")")
          } else {
            is_js = true
            out.write("aran.eval(")
          }
        } else if (tag === "html") {
          out.write("<script>")
          out.write(js_escape(opt_buf))
          out.write(js_escape(buf))
          out.write("</script>")
        }
      },
      // text nodes are not decoded (&lt; does not become <)
      ontext: function(text) {
        if (is_js) { text = JSON.stringify(js_escape(text)) }
        out.write(text)
      },
      onclosetag: function(tag) {
        if (tag === "script") {
          is_js = false
          out.write(")")
        }
        out.write("</")
        out.write(tag)
        out.write(">")
      }
    }))

  })

}
